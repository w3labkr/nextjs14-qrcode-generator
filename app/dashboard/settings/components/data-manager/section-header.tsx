import { FileDown } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export default function SectionHeader({
  title,
  description,
  icon: Icon = FileDown,
}: SectionHeaderProps) {
  return (
    <>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <h4 className="font-medium">{title}</h4>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </>
  );
}
