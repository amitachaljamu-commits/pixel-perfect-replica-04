import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Boxes, ChevronDown, LogOut, Menu, Search, Settings, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { actions, useStore } from "@/lib/inventory";
import { cn } from "@/lib/utils";

const navLink =
  "inline-flex h-12 items-center gap-1 border-b-2 border-transparent px-3 text-sm font-medium text-nav-foreground transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const active = { className: "border-primary text-primary" };

type NavItem = { label: string; to: string };
const operations: NavItem[] = [
  { label: "Receipts", to: "/receipts" },
  { label: "Deliveries", to: "/deliveries" },
  { label: "Adjustments", to: "/stock" },
];
const settings: NavItem[] = [
  { label: "Warehouses", to: "/settings/warehouses" },
  { label: "Locations", to: "/settings/locations" },
];

function Dropdown({ label, items, prefixes }: { label: string; items: NavItem[]; prefixes: string[] }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isActive = prefixes.some((p) => path.startsWith(p));
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn(navLink, isActive && active.className)}>
        {label} <ChevronDown className="size-3.5" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-44">
        {items.map((i) => (
          <DropdownMenuItem key={i.label} asChild>
            <Link to={i.to}>{i.label}</Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const session = useStore((s) => s.session);
  const ops = useStore((s) => s.operations);
  const products = useStore((s) => s.products);
  const navigate = useNavigate();
  const [hydrated, setHydrated] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => setHydrated(true), []);
  useEffect(() => {
    if (hydrated && !session) navigate({ to: "/login" });
  }, [hydrated, session, navigate]);
  useEffect(() => setMobileOpen(false), [path]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (to: string, params?: Record<string, string>) => {
    setSearchOpen(false);
    navigate({ to, params } as never);
  };

  const allLinks: NavItem[] = [
    { label: "Dashboard", to: "/" },
    ...operations,
    { label: "Products", to: "/products" },
    { label: "Stock", to: "/stock" },
    { label: "Move History", to: "/move-history" },
    ...settings,
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-nav">
        <div className="mx-auto flex h-12 max-w-[1440px] items-center gap-1 px-2 md:px-4">
          <button
            className="inline-flex size-9 items-center justify-center rounded-md hover:bg-surface-hover lg:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <Link to="/" className="mr-3 flex items-center gap-2 px-2 font-semibold text-foreground">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Boxes className="size-4" aria-hidden />
            </span>
            StockSense
          </Link>
          <nav className="hidden items-center lg:flex" aria-label="Primary">
            <Link to="/" className={navLink} activeProps={active} activeOptions={{ exact: true }}>
              Dashboard
            </Link>
            <Dropdown label="Operations" items={operations} prefixes={["/receipts", "/deliveries", "/operations"]} />
            <Link to="/products" className={navLink} activeProps={active}>
              Products
            </Link>
            <Link to="/stock" className={navLink} activeProps={active}>
              Stock
            </Link>
            <Link to="/move-history" className={navLink} activeProps={active}>
              Move History
            </Link>
            <Dropdown label="Settings" items={settings} prefixes={["/settings"]} />
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex h-8 items-center gap-2 rounded-md border border-border bg-background px-2.5 text-sm text-muted-foreground hover:border-border-strong"
              aria-label="Search (Ctrl+K)"
            >
              <Search className="size-4" aria-hidden />
              <span className="hidden md:inline">Search…</span>
              <kbd className="hidden rounded-sm border border-border px-1 text-[11px] md:inline">Ctrl K</kbd>
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger
                className="ml-1 flex size-8 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground"
                aria-label="Account menu"
              >
                {(session ?? "?").slice(0, 1).toUpperCase()}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-48">
                <DropdownMenuLabel>{session}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings/warehouses">
                    <Settings className="size-4" /> Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    actions.logout();
                    navigate({ to: "/login" });
                  }}
                >
                  <LogOut className="size-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {mobileOpen && (
          <nav className="border-t border-border bg-nav px-2 py-2 lg:hidden" aria-label="Mobile">
            {allLinks.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-surface-hover"
                activeProps={{ className: "bg-accent text-accent-foreground" }}
                activeOptions={{ exact: true }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <main>{hydrated && session ? children : null}</main>

      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Search pages, operations, products…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => go("/operations/$id", { id: actions.createOperation("IN") })}>
              New receipt
            </CommandItem>
            <CommandItem onSelect={() => go("/operations/$id", { id: actions.createOperation("OUT") })}>
              New delivery
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Pages">
            {allLinks.map((l) => (
              <CommandItem key={l.label} onSelect={() => go(l.to)}>
                {l.label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Operations">
            {ops.map((o) => (
              <CommandItem key={o.id} value={`${o.ref} ${o.contact}`} onSelect={() => go("/operations/$id", { id: o.id })}>
                <span className="font-medium">{o.ref}</span>
                <span className="text-muted-foreground">{o.contact}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Products">
            {products.map((p) => (
              <CommandItem key={p.id} value={`${p.sku} ${p.name}`} onSelect={() => go("/products")}>
                [{p.sku}] {p.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
