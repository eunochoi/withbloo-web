'use server';

import { PutObjectCommand } from '@aws-sdk/client-s3';
import { Prisma } from '@prisma/client';
import { Buffer } from 'node:buffer';
import { createHash, randomUUID } from 'node:crypto';
import sharp from 'sharp';

import { prisma } from '../../../../lib/prisma';
import { getAuth } from '../../auth/getAuth';
import {
  DIARY_IMAGE_ALLOWED_MIME_TYPES,
  DIARY_IMAGE_MAX_COUNT,
  DIARY_IMAGE_MAX_SIZE_BYTES,
  DIARY_IMAGE_MAX_SIZE_MB,
} from '../../constants/image';
import { getEnvValue } from '../../utils/getEnvValue';
import type { ActionResult } from '../types';
import type { UploadedImage } from './types';
import { createAuthErrorResult, createErrorResult, createImageSignedUrl, createS3Client } from './utils';

export const uploadImages = async (formData: FormData): Promise<ActionResult<UploadedImage[]>> => {
  try {
    const auth = await getAuth();
    if (!auth.ok) return createAuthErrorResult(auth);

    const files = formData
      .getAll('image')
      .filter((file): file is File => file instanceof File && file.size > 0);

    if (files.length === 0) {
      return createErrorResult('IMAGE_REQUIRED', '이미지 파일이 없습니다.');
    }

    if (files.length > DIARY_IMAGE_MAX_COUNT) {
      return createErrorResult('IMAGE_COUNT_EXCEEDED', `이미지 파일은 최대 ${DIARY_IMAGE_MAX_COUNT}개까지 삽입 가능합니다.`);
    }

    const invalidTypeFile = files.find((file) => !DIARY_IMAGE_ALLOWED_MIME_TYPES.includes(file.type as typeof DIARY_IMAGE_ALLOWED_MIME_TYPES[number]));
    if (invalidTypeFile) {
      return createErrorResult('INVALID_IMAGE_TYPE', '이미지 파일만 업로드 가능합니다.');
    }

    const overSizeFile = files.find((file) => file.size > DIARY_IMAGE_MAX_SIZE_BYTES);
    if (overSizeFile) {
      return createErrorResult('IMAGE_SIZE_EXCEEDED', `선택된 이미지 중 ${DIARY_IMAGE_MAX_SIZE_MB}MB를 초과하는 이미지가 존재합니다.`);
    }

    const s3 = createS3Client();
    const uploadedImages: UploadedImage[] = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());

      const optimizedImage = await sharp(buffer, { failOn: 'none' })
        .resize(1920, 1920, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .flatten({ background: '#ffffff' })
        .jpeg({
          quality: 85,
          progressive: false,
        })
        .toBuffer();

      // 파일 이름이 아니라 최적화된 실제 이미지 데이터로 중복 여부를 판단한다.
      const contentHash = createHash('sha256')
        .update(optimizedImage)
        .digest('hex');

      const imageContentSelect = {
        id: true,
        storagePath: true,
        status: true,
      } as const;

      let imageContent = await prisma.imageContent.findUnique({
        where: {
          contentHash,
        },
        select: imageContentSelect,
      });

      if (!imageContent) {
        const imageContentId = randomUUID();
        const storagePath = `objects/${contentHash}.jpg`;

        try {
          imageContent = await prisma.imageContent.create({
            data: {
              id: imageContentId,
              contentHash,
              storagePath,
              contentType: 'image/jpeg',
              size: optimizedImage.length,
              status: 'PENDING',
            },
            select: imageContentSelect,
          });
        } catch (error) {
          // 동시에 같은 이미지를 업로드한 요청이 먼저 ImageContent을 만든 경우다.
          if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') {
            throw error;
          }

          imageContent = await prisma.imageContent.findUniqueOrThrow({
            where: { contentHash },
            select: imageContentSelect,
          });
        }
      }

      // 이미 OCI에 준비된 물리 이미지가 있으면 재업로드하지 않는다.
      if (imageContent.status !== 'READY') {
        await prisma.imageContent.update({
          where: { id: imageContent.id },
          data: {
            contentType: 'image/jpeg',
            size: optimizedImage.length,
            status: 'PENDING',
          },
        });

        try {
          await s3.send(new PutObjectCommand({
            Bucket: getEnvValue('OCI_BUCKET_NAME'),
            Key: imageContent.storagePath,
            Body: optimizedImage,
            ContentType: 'image/jpeg',
          }));

          await prisma.imageContent.update({
            where: { id: imageContent.id },
            data: { status: 'READY' },
          });
        } catch (error) {
          await prisma.imageContent.update({
            where: { id: imageContent.id },
            data: { status: 'FAILED' },
          });
          throw error;
        }
      }

      // 물리 콘텐츠에 현재 사용자를 연결한다.
      // ImageContent는 여러 사용자가 공유할 수 있지만, 연결된 사용자만 사용할 수 있다.
      await prisma.imageContent.update({
        where: { id: imageContent.id },
        data: {
          users: {
            connect: { id: auth.userId },
          },
        },
      });

      uploadedImages.push({
        imageContentId: imageContent.id,
        src: await createImageSignedUrl(imageContent.storagePath),
      });
    }

    return { ok: true, data: uploadedImages };
  } catch (error) {
    console.error('이미지 업로드 실패:', error);
    return createErrorResult('IMAGE_UPLOAD_FAILED', '이미지 업로드 중 오류가 발생했습니다.');
  }
};
