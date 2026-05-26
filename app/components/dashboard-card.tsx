import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";


type DashboardCardProps = {
  title: string;
  value: string;
};

export function DashboardCard({ title, value }: DashboardCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{title}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="text-4xl font-bold tracking-tight">
          {value}
        </div>
      </CardContent>
    </Card>
  );
}