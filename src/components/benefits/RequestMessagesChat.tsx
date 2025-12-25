import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Send, Clock, User, MessageSquare, Bell, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  benefit_request_id: string;
  sender_id: string;
  sender_name: string | null;
  message: string;
  sent_via: string | null;
  created_at: string;
}

interface RequestMessagesChatProps {
  requestId: string;
  protocol: string;
  collaboratorName: string;
  collaboratorPhone: string | null;
  accountId: number | null;
  conversationId: number | null;
  status: string;
  onNewMessage?: () => void;
}

export function RequestMessagesChat({
  requestId,
  protocol,
  collaboratorName,
  collaboratorPhone,
  accountId,
  conversationId,
  status,
  onNewMessage,
}: RequestMessagesChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Check if communication is allowed (only for open or in analysis)
  const canCommunicate = status === "aberta" || status === "em_analise";

  useEffect(() => {
    fetchCurrentUser();
    fetchMessages();
    setupRealtimeSubscription();

    return () => {
      supabase.removeChannel(supabase.channel(`messages-${requestId}`));
    };
  }, [requestId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .single();
      setCurrentUserName(profile?.full_name || "Gestor");
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("request_messages")
        .select("*")
        .eq("benefit_request_id", requestId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`messages-${requestId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "request_messages",
          filter: `benefit_request_id=eq.${requestId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            // Check if message already exists
            if (prev.find((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });

          // Notify if message is from collaborator
          if (newMsg.sent_via === "whatsapp") {
            toast.info(`Nova mensagem de ${newMsg.sender_name || "Colaborador"}`, {
              icon: <Bell className="h-4 w-4" />,
            });
            onNewMessage?.();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUserId) return;

    setSending(true);
    try {
      // Save message to database
      const { error: dbError } = await supabase.from("request_messages").insert({
        benefit_request_id: requestId,
        sender_id: currentUserId,
        sender_name: currentUserName,
        message: newMessage.trim(),
        sent_via: "portal",
      });

      if (dbError) throw dbError;

      // Send via WhatsApp webhook
      if (collaboratorPhone) {
        const webhookData = {
          protocolo: protocol,
          nome_colaborador: collaboratorName,
          telefone_whatsapp: collaboratorPhone,
          mensagem: newMessage.trim(),
          tipo: "mensagem_direta",
          account_id: accountId,
          conversation_id: conversationId,
        };

        await fetch("https://n8n.revalle.com.br/webhook/aprovacao", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(webhookData),
        });
      }

      setNewMessage("");
      toast.success("Mensagem enviada!");
    } catch (error: any) {
      console.error("Erro ao enviar mensagem:", error);
      toast.error("Erro ao enviar mensagem: " + error.message);
    } finally {
      setSending(false);
    }
  };

  // Get last collaborator message
  const lastCollaboratorMessage = messages
    .filter((m) => m.sent_via === "whatsapp")
    .slice(-1)[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Last collaborator message highlight */}
      {lastCollaboratorMessage && (
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-primary">Última mensagem do colaborador</span>
          </div>
          <p className="text-sm">{lastCollaboratorMessage.message}</p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(lastCollaboratorMessage.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
        </div>
      )}

      {/* Messages list */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Histórico de Mensagens
          {messages.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {messages.length}
            </Badge>
          )}
        </h4>

        <ScrollArea className="h-[280px] rounded-lg border border-border p-3" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">Nenhuma mensagem ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => {
                const isFromCollaborator = msg.sent_via === "whatsapp";
                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex flex-col max-w-[85%] rounded-lg p-3 animate-fade-in",
                      isFromCollaborator
                        ? "bg-muted/70 mr-auto"
                        : "bg-primary/10 ml-auto"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-medium">
                        {msg.sender_name || (isFromCollaborator ? collaboratorName : "Gestor")}
                      </span>
                      {isFromCollaborator && (
                        <Badge variant="outline" className="text-[10px] py-0 px-1">
                          WhatsApp
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm">{msg.message}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {format(new Date(msg.created_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Send message */}
      {canCommunicate ? (
        <div className="space-y-3">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            rows={3}
            disabled={sending}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            onClick={handleSendMessage}
            disabled={sending || !newMessage.trim()}
            className="w-full"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {sending ? "Enviando..." : "Enviar Mensagem"}
          </Button>
          {!collaboratorPhone && (
            <p className="text-xs text-warning text-center">
              ⚠️ Colaborador sem telefone. Mensagem será salva mas não enviada via WhatsApp.
            </p>
          )}
        </div>
      ) : (
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Comunicação disponível apenas para protocolos em atendimento ou análise.
          </p>
        </div>
      )}
    </div>
  );
}
