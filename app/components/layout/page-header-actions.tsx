type PageHeaderActionsProps = {
  children: React.ReactNode;
};

export function PageHeaderActions({ children }: PageHeaderActionsProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      {children}
    </div>
  );
}