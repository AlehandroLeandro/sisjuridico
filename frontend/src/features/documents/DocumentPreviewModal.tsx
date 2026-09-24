import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Modal } from "../../shared/ui/Modal";
import { Button } from "../../shared/ui/Button";
import { LoadingState, ErrorState } from "../../shared/ui/States";
import { downloadDocument, triggerBrowserDownload, type Document } from "./api";

interface DocumentPreviewModalProps {
  doc: Document;
  onClose: () => void;
}

/**
 * Inline preview for "Visualizar". The file is requested from the authenticated
 * backend and exposed locally to the browser as an object URL.
 */
export function DocumentPreviewModal({ doc, onClose }: DocumentPreviewModalProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["documents", doc.id, "download"],
    queryFn: () => downloadDocument(doc.id),
  });
  const objectUrl = useMemo(() => (data ? URL.createObjectURL(data) : null), [data]);

  useEffect(() => {
    if (!objectUrl) return;
    return () => URL.revokeObjectURL(objectUrl);
  }, [objectUrl]);

  const isPdf = doc.contentType === "application/pdf";
  const isImage = doc.contentType.startsWith("image/");

  return (
    <Modal title={doc.fileName} onClose={onClose} width={720}>
      {isLoading && <LoadingState label="Carregando pré-visualização..." />}
      {isError && <ErrorState label="Não foi possível carregar a pré-visualização. Tente novamente." />}
      {!isLoading && !isError && data && objectUrl && (
        <>
          {isPdf && (
            <iframe title={doc.fileName} src={objectUrl} style={{ width: "100%", height: "70vh", border: "none" }} />
          )}
          {!isPdf && isImage && (
            <img
              src={objectUrl}
              alt={doc.fileName}
              style={{ maxWidth: "100%", maxHeight: "70vh", display: "block", margin: "0 auto" }}
            />
          )}
          {!isPdf && !isImage && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 16 }}>
                Pré-visualização não disponível para este tipo de arquivo.
              </p>
              <Button variant="primary" onClick={() => triggerBrowserDownload(data, doc.fileName)}>
                Baixar arquivo
              </Button>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
