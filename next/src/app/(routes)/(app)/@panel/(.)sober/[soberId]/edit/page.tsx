import SoberFormEntry from '@/common/components/features/Sober/SoberFormEntry';
export default function EditSoberPage({ params }: { params: { soberId: string } }) { return <SoberFormEntry id={params.soberId} />; }
