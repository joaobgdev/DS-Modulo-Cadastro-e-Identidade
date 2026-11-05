import { useEffect, useState, useMemo, ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Archive,
  ChartNoAxesCombined,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  ClipboardPlus,
  ExternalLink,
  FileHeart,
  Headset,
  KeyRound,
  LayoutDashboard,
  ListTodo,
  Menu,
  Notebook,
  Shield,
  User,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/auth-context';
import { BrandAssetSlot } from '../brand/brand-asset-slot';
import { ThemeToggle } from '../ui/theme-toggle';
import { UserDropdown } from '../ui/user-dropdown';

const SIDEBAR_STORAGE_KEY = 'appstart_sidebar_collapsed';

interface NavigationItem {
  label: string;
  path?: string;
  rootPath?: string;
  icon?: ReactNode;
  badge?: string | number | null;
  children?: NavigationItem[];
}

interface NavigationGroup {
  heading: string;
  items: NavigationItem[];
}

export function AuthLayout() {
  const { user, isAdmin, logout, manageAccount } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigationGroups: NavigationGroup[] = useMemo(
    () => [
      {
        heading: 'Visão Geral',
        items: [
          {
            label: 'Início',
            path: '/',
            icon: <LayoutDashboard className="h-4 w-4 shrink-0" />,
            badge: null,
          },
        ],
      },
      {
        heading: 'Módulos',
        items: [
          {
            label: 'Fluxo assistencial',
            rootPath: '/schedules',
            icon: <Notebook className="h-4 w-4 shrink-0" />,
            badge: null,
            children: [
              {
                label: 'Agenda',
                path: '/schedules/home',
                icon: null,
                badge: null,
              },
              {
                label: 'Novo agendamento',
                path: '/schedules/new',
                icon: null,
                badge: null,
              },
              {
                label: 'Confirmações',
                path: '/schedules/confirmations',
                icon: null,
                badge: '2',
              },
              {
                label: 'Pacientes',
                path: '/schedules/patients',
                icon: null,
                badge: null,
              },
              {
                label: 'E-mails enviados',
                path: '/schedules/emails',
                icon: null,
                badge: null,
              },
            ],
          },
          {
            label: 'Estoque e insumos',
            path: '/supplies',
            icon: <Archive className="h-4 w-4 shrink-0" />,
            badge: null,
          },
          {
            label: 'Produção e BPA',
            rootPath: '/bpa',
            icon: <ClipboardPlus className="h-4 w-4 shrink-0" />,
            badge: null,
            children: [
              {
                label: 'Dashboard',
                path: '/bpa/dashboard',
                icon: null,
                badge: null,
              },
              {
                label: 'Atendimentos',
                path: '/bpa/appointments',
                icon: null,
                badge: null,
              },
              {
                label: 'Inconsistências',
                path: '/bpa/inconsistencies',
                icon: null,
                badge: null,
              },
              {
                label: 'Procedimentos',
                path: '/bpa/procedures',
                icon: null,
                badge: null,
              },
              {
                label: 'Relatórios',
                path: '/bpa/reports',
                icon: null,
                badge: null,
              },
            ],
          },
          {
            label: 'Gestão e indicadores',
            path: '/analytics',
            icon: <ChartNoAxesCombined className="h-4 w-4 shrink-0" />,
            badge: null,
          },
          {
            label: 'Prontuário',
            path: '/records',
            icon: <FileHeart className="h-4 w-4 shrink-0" />,
            badge: null,
          },
          {
            label: 'Fichas Clínicas',
            path: '/templates',
            icon: <ClipboardList className="h-4 w-4 shrink-0" />,
            badge: null,
          },
          {
            label: 'Telessaúde',
            path: '/telehealth',
            icon: <Headset className="h-4 w-4 shrink-0" />,
            badge: null,
          },
          {
            label: 'Tarefas (Demo)',
            path: '/demo',
            icon: <ListTodo className="h-4 w-4 shrink-0" />,
            badge: 'Ref',
          },
          ...(isAdmin
            ? [
                {
                  label: 'Usuários',
                  path: '/users',
                  icon: <Users className="h-4 w-4 shrink-0" />,
                  badge: 'Admin',
                },
              ]
            : []),
        ],
      },
      {
        heading: 'Conta',
        items: [
          {
            label: 'Meu Perfil',
            path: '/profile',
            icon: <User className="h-4 w-4 shrink-0" />,
            badge: null,
          },
        ],
      },
    ],
    [isAdmin]
  );

  const getPageContext = (path: string) => {
    const currentPath = (path || '').replace(/\/$/, '') || '/';

    for (const group of navigationGroups) {
      for (const item of group.items) {
        // Se for um Módulo com submenus (children)
        if (item.children && item.rootPath) {
          const normalizedRoot = item.rootPath.replace(/\/$/, '');
          if (currentPath === normalizedRoot || currentPath.startsWith(`${normalizedRoot}/`)) {
            const activeChild = item.children.find((child) => {
              if (!child.path) return false;
              const normalizedChild = child.path.replace(/\/$/, '');
              return currentPath === normalizedChild || currentPath.startsWith(`${normalizedChild}/`);
            });

            return {
              category: item.label, // Ex: "Fluxo assistencial" (Módulo)
              title: activeChild ? activeChild.label : item.label, // Ex: "Agenda" (Tela/Submenu)
            };
          }
        }

        // Se for um item direto (Sem submenus)
        if (item.path) {
          const normalizedItemPath = item.path === '/' ? '/' : item.path.replace(/\/$/, '');
          const isMatch =
            normalizedItemPath === '/'
              ? currentPath === '/'
              : currentPath === normalizedItemPath || currentPath.startsWith(`${normalizedItemPath}/`);

          if (isMatch) {
            return {
              category: null, // Não exibe o grupo "Módulos"
              title: item.label, // Ex: "Prontuário"
            };
          }
        }
      }
    }

    return { category: null, title: 'Painel' };
  };

  const pageContext = getPageContext(location.pathname);

  useEffect(() => {
    setTimeout(() => setIsMobileOpen(false), 0);

    // Notifica navegações originadas pelo Shell aos MFEs
    window.dispatchEvent(
      new CustomEvent('shell-navigated', {
        detail: { pathname: location.pathname, search: location.search },
      })
    );
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleMfeNavigation = (event: Event) => {
      const customEvent = event as CustomEvent<{ pathname: string; search?: string }>;
      const targetPath = customEvent.detail.pathname + (customEvent.detail.search || '');

      if (location.pathname !== customEvent.detail.pathname) {
        navigate(targetPath, { replace: true });
      }
    };

    window.addEventListener('mfe-navigated', handleMfeNavigation);
    return () => window.removeEventListener('mfe-navigated', handleMfeNavigation);
  }, [navigate, location.pathname]);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch {
        console.warn('Não foi possível salvar o estado da sidebar no localStorage.');
      }
      return next;
    });
  };

  const toggleGroup = (label: string, currentIsExpanded: boolean) => {
    setExpandedGroups((prev) => ({ ...prev, [label]: !currentIsExpanded }));
  };

  const showCompactBrand = isCollapsed && !isMobileOpen;

  return (
    <div className="min-h-screen flex bg-canvas text-body font-sans antialiased">
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-brand-dark/70 backdrop-blur-xs md:hidden animate-in fade-in duration-150"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        id="sidebar"
        className={`fixed md:sticky top-0 z-50 h-screen flex flex-col bg-sidebar text-sidebar-fg border-r border-sidebar-line shadow-xl md:shadow-none transition-all duration-300 ease-in-out w-72 ${
          isCollapsed ? 'md:w-20' : 'md:w-64'
        } ${
          isMobileOpen
            ? 'translate-x-0'
            : '-translate-x-full md:translate-x-0'
        }`}
      >
        <button
          onClick={toggleSidebar}
          className="hidden md:flex absolute -right-3 top-6 z-50 h-6 w-6 rounded-full bg-sidebar border border-sidebar-line text-sidebar-muted hover:text-sidebar-fg hover:bg-sidebar-active hover:border-sidebar-active shadow-md items-center justify-center transition-all cursor-pointer hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        >
          {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>

        <div
          className={`h-18 flex items-center border-b border-sidebar-line shrink-0 transition-all ${
            showCompactBrand ? 'justify-center px-2' : 'justify-between px-4'
          }`}
        >
          <Link
            to="/"
            className="flex items-center rounded-md text-sidebar-fg"
          >
            {showCompactBrand ? (
              <BrandAssetSlot variant="compact" />
            ) : (
              <BrandAssetSlot variant="header" />
            )}
          </Link>

          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-sidebar-muted hover:text-sidebar-fg hover:bg-sidebar-hover shrink-0"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-3 [scrollbar-width:thin] [scrollbar-color:var(--color-sidebar-line,currentColor)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-sidebar-line hover:[&::-webkit-scrollbar-thumb]:bg-sidebar-muted [&::-webkit-scrollbar-thumb]:rounded-full">
          {navigationGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {!isCollapsed ? (
                <div className="px-3 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-sidebar-muted">
                  {group.heading}
                </div>
              ) : (
                <div className="my-2 border-t border-sidebar-line" />
              )}

              {group.items.map((item: NavigationItem) => {
                const hasChildren = item.children && item.children.length > 0;

                if (hasChildren) {
                  const isParentActive = item.children!.some((child: NavigationItem) => {
                    if (!child.path) return false;
                    const normalizedPath = child.path.replace(/\/$/, '');
                    const normalizedLocation = location.pathname.replace(/\/$/, '');
                    return normalizedLocation === normalizedPath || normalizedLocation.startsWith(`${normalizedPath}/`);
                  });

                  const isExpanded = expandedGroups[item.label] ?? isParentActive;

                  return (
                    <div key={item.label} className="space-y-1">
                      <button
                        onClick={() => {
                          if (isCollapsed) toggleSidebar();
                          toggleGroup(item.label, isExpanded);
                        }}
                        title={isCollapsed ? item.label : undefined}
                        className={`w-full flex items-center justify-between rounded-lg text-sm font-medium transition-colors group relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-indicator ${
                          isCollapsed ? 'justify-center h-10 w-10 mx-auto px-0' : 'px-3 py-2'
                        } ${
                          isParentActive
                            ? 'bg-sidebar-active text-sidebar-fg font-semibold shadow-sm'
                            : 'text-sidebar-muted hover:text-sidebar-fg hover:bg-sidebar-hover'
                        }`}
                      >
                        {isParentActive && !isCollapsed && (
                          <span
                            aria-hidden="true"
                            className="absolute -left-3 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r bg-sidebar-indicator"
                          />
                        )}

                        <div className="flex items-center gap-3">
                          <div className={isParentActive ? 'text-sidebar-fg' : 'text-sidebar-muted group-hover:text-sidebar-fg'}>
                            {item.icon}
                          </div>
                          {!isCollapsed && <span className="truncate">{item.label}</span>}
                        </div>
                        {!isCollapsed && (
                          <ChevronDown
                            className={`h-4 w-4 transition-transform duration-200 ${
                              isParentActive ? 'text-sidebar-fg' : 'text-sidebar-muted'
                            } ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        )}
                      </button>

                      {isExpanded && !isCollapsed && (
                        <div className="ml-1 border-l border-sidebar-line/50 pl-2 space-y-1 mt-1">
                          {item.children!.map((child: NavigationItem) => (
                            <NavLink
                              key={child.path}
                              to={child.path!}
                              className={({ isActive }) =>
                                `flex items-center gap-3 rounded-lg text-sm font-medium transition-colors group relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-indicator px-3 py-2 ${
                                  isActive
                                    ? 'bg-sidebar-active text-sidebar-fg font-semibold shadow-sm'
                                    : 'text-sidebar-muted hover:text-sidebar-fg hover:bg-sidebar-hover'
                                }`
                              }
                            >
                              {({ isActive }) => (
                                <>
                                  {isActive && (
                                    <span
                                      aria-hidden="true"
                                      className="absolute -left-[9px] top-1/2 -translate-y-1/2 h-5 w-[2px] bg-sidebar-indicator"
                                    />
                                  )}
                                  <div className={isActive ? 'text-sidebar-fg' : 'text-sidebar-muted group-hover:text-sidebar-fg'}>
                                    {child.icon}
                                  </div>
                                  <div className="flex items-center justify-between flex-1 truncate">
                                    <span className="truncate">{child.label}</span>
                                    {child.badge && (
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-sidebar-fg/20 text-sidebar-fg' : 'bg-sidebar-hover text-sidebar-muted'}`}>
                                        {child.badge}
                                      </span>
                                    )}
                                  </div>
                                </>
                              )}
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <NavLink
                    key={item.label}
                    to={item.path!}
                    title={isCollapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg text-sm font-medium transition-colors group relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-indicator ${
                        isCollapsed ? 'justify-center h-10 w-10 mx-auto px-0' : 'px-3 py-2'
                      } ${
                        isActive
                          ? 'bg-sidebar-active text-sidebar-fg font-semibold shadow-sm'
                          : 'text-sidebar-muted hover:text-sidebar-fg hover:bg-sidebar-hover'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && !isCollapsed && (
                          <span
                            aria-hidden="true"
                            className="absolute -left-3 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r bg-sidebar-indicator"
                          />
                        )}

                        <div
                          className={`${
                            isActive
                              ? 'text-sidebar-fg'
                              : 'text-sidebar-muted group-hover:text-sidebar-fg'
                          }`}
                        >
                          {item.icon}
                        </div>

                        {!isCollapsed && (
                          <div className="flex items-center justify-between flex-1 truncate">
                            <span className="truncate">{item.label}</span>
                            {item.badge && (
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                                  isActive
                                    ? 'bg-sidebar-fg/20 text-sidebar-fg'
                                    : 'bg-sidebar-hover text-sidebar-muted border border-sidebar-line'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-sidebar-line shrink-0">
          {!isCollapsed ? (
            <button
              onClick={manageAccount}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-sidebar-muted hover:text-sidebar-fg hover:bg-sidebar-hover transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <KeyRound className="h-3.5 w-3.5 text-sidebar-indicator" />
                <span>Central de Segurança</span>
              </span>
              <ExternalLink className="h-3.5 w-3.5 opacity-60" />
            </button>
          ) : (
            <button
              onClick={manageAccount}
              title="Central de Segurança"
              aria-label="Central de Segurança"
              className="h-10 w-10 mx-auto flex items-center justify-center rounded-lg text-sidebar-muted hover:text-sidebar-fg hover:bg-sidebar-hover transition-colors cursor-pointer"
            >
              <KeyRound className="h-4 w-4 text-sidebar-indicator" />
            </button>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header
          id="page-header"
          className="sticky top-0 z-40 h-18 border-b border-line bg-surface/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 rounded-lg text-body hover:bg-surface-muted shrink-0"
              aria-label="Abrir menu lateral"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link
              to="/"
              aria-label="Clínica Digital UFPE — página inicial"
              data-testid="mobile-brand"
              className="md:hidden flex items-center text-heading rounded-md"
            >
              <BrandAssetSlot variant="compact" className="min-[340px]:hidden" />
              <BrandAssetSlot variant="reduced" className="hidden min-[340px]:inline-flex" />
            </Link>

            <div className="hidden md:flex items-center gap-2 text-xs">
              {pageContext.category ? (
                <>
                  {/* Módulo em destaque */}
                  <span className="font-bold text-heading text-sm">
                    {pageContext.category}
                  </span>
                  <span className="text-muted" aria-hidden="true">/</span>
                  {/* Tela / Submenu em cinza */}
                  <span className="text-muted font-medium">
                    {pageContext.title}
                  </span>
                </>
              ) : (
                /* Página única em destaque */
                <span className="font-bold text-heading text-sm">
                  {pageContext.title}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <ThemeToggle />

            <UserDropdown
              user={user}
              isAdmin={isAdmin}
              onLogout={logout}
              onManageAccount={manageAccount}
            />
          </div>
        </header>

        <main id="main" className="flex-1 container mx-auto px-4 sm:px-6 py-8 max-w-6xl">
          <Outlet />
        </main>

        <footer className="border-t border-line bg-surface/60 py-4 px-4 sm:px-6 text-xs text-muted">
          <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between gap-3 text-center lg:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-body">
              <BrandAssetSlot variant="institutional-lockup" />
              <span className="font-bold text-heading">Clínica Digital UFPE</span>
            </div>
            <span className="flex items-center gap-1">
              <Shield className="h-3.5 w-3.5 text-accent-text" aria-hidden="true" />
              Sessão OIDC protegida por cookies HTTP-only
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}