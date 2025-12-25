-- Restaurar o benefit_type original das solicitações usando os logs de auditoria
UPDATE benefit_requests br
SET benefit_type = (l.details->>'benefit_type')::benefit_type
FROM logs l
WHERE l.entity_id = br.id 
  AND l.action = 'benefit_request_created'
  AND l.details->>'benefit_type' IS NOT NULL
  AND br.benefit_type NOT IN ('autoescola', 'farmacia', 'oficina', 'vale_gas', 'papelaria', 'otica', 'outros');