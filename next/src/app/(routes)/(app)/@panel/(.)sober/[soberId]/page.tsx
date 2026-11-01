import SoberDetailEntry from '@/common/components/features/Sober/SoberDetailEntry';
export default function SoberDetailPage({ params }: { params: { soberId: string } }) { return <SoberDetailEntry id={params.soberId} />; }
