import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Users, Building2, Command } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { supabase } from '@/integrations/supabase/client';
import { benefitTypeLabels } from '@/types/benefits';

interface SearchResult {
  id: string;
  type: 'protocol' | 'colaborador' | 'unidade';
  title: string;
  subtitle: string;
  url: string;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const searchData = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    const searchResults: SearchResult[] = [];

    try {
      // Search protocols
      const { data: protocols } = await supabase
        .from('benefit_requests')
        .select('id, protocol, benefit_type, status')
        .or(`protocol.ilike.%${query}%`)
        .limit(5);

      if (protocols) {
        protocols.forEach((p) => {
          searchResults.push({
            id: p.id,
            type: 'protocol',
            title: p.protocol,
            subtitle: benefitTypeLabels[p.benefit_type as keyof typeof benefitTypeLabels] || p.benefit_type,
            url: `/solicitacoes?protocol=${p.protocol}`,
          });
        });
      }

      // Search colaboradores
      const { data: colaboradores } = await supabase
        .from('profiles')
        .select('id, full_name, cpf')
        .or(`full_name.ilike.%${query}%,cpf.ilike.%${query}%`)
        .limit(5);

      if (colaboradores) {
        colaboradores.forEach((c) => {
          searchResults.push({
            id: c.id,
            type: 'colaborador',
            title: c.full_name,
            subtitle: c.cpf ? `CPF: ${c.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}` : 'Sem CPF',
            url: `/colaboradores`,
          });
        });
      }

      // Search units
      const { data: units } = await supabase
        .from('units')
        .select('id, name, code')
        .or(`name.ilike.%${query}%,code.ilike.%${query}%`)
        .limit(5);

      if (units) {
        units.forEach((u) => {
          searchResults.push({
            id: u.id,
            type: 'unidade',
            title: u.name,
            subtitle: `Código: ${u.code}`,
            url: `/unidades`,
          });
        });
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchData(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, searchData]);

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    setSearch('');
    navigate(result.url);
  };

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'protocol':
        return <FileText className="h-4 w-4" />;
      case 'colaborador':
        return <Users className="h-4 w-4" />;
      case 'unidade':
        return <Building2 className="h-4 w-4" />;
    }
  };

  const protocols = results.filter((r) => r.type === 'protocol');
  const colaboradores = results.filter((r) => r.type === 'colaborador');
  const unidades = results.filter((r) => r.type === 'unidade');

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted/50 hover:bg-muted text-muted-foreground text-sm transition-colors"
      >
        <Search className="h-4 w-4" />
        <span>Buscar...</span>
        <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <Command className="h-3 w-3" />K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Buscar protocolos, colaboradores, unidades..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          {loading && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Buscando...
            </div>
          )}
          
          {!loading && search.length >= 2 && results.length === 0 && (
            <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          )}

          {!loading && search.length < 2 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Digite ao menos 2 caracteres para buscar
            </div>
          )}

          {protocols.length > 0 && (
            <CommandGroup heading="Protocolos">
              {protocols.map((result) => (
                <CommandItem
                  key={result.id}
                  value={result.title}
                  onSelect={() => handleSelect(result)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {getIcon(result.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono font-semibold text-sm">{result.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {colaboradores.length > 0 && (
            <>
              {protocols.length > 0 && <CommandSeparator />}
              <CommandGroup heading="Colaboradores">
                {colaboradores.map((result) => (
                  <CommandItem
                    key={result.id}
                    value={result.title}
                    onSelect={() => handleSelect(result)}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                      {getIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{result.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {unidades.length > 0 && (
            <>
              {(protocols.length > 0 || colaboradores.length > 0) && <CommandSeparator />}
              <CommandGroup heading="Unidades">
                {unidades.map((result) => (
                  <CommandItem
                    key={result.id}
                    value={result.title}
                    onSelect={() => handleSelect(result)}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      {getIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{result.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
