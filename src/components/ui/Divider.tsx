export default function Divider() {
  return (
    <div className="flex items-center justify-center py-4 px-5">
      <div className="flex-1 h-px bg-border" />
      <div className="mx-4 text-primary text-xs tracking-widest">&#10047;</div>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}
