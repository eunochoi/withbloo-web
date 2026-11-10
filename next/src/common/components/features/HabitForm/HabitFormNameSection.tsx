import HabitFormNameInput from './HabitFormNameInput';

interface HabitFormNameSectionProps {
  name: string;
  setName: (value: string) => void;
}

const HabitFormNameSection = ({
  name,
  setName,
}: HabitFormNameSectionProps) => (
  <section aria-labelledby="habit-name-title" className="flex w-full flex-col gap-3">
    <h2 id="habit-name-title" className=" text-lg font-semibold text-theme-text-primary">이름</h2>
    <HabitFormNameInput name={name} setName={setName} />
  </section>
);

export default HabitFormNameSection;
