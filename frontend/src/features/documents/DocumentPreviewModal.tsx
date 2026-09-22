import { useQuery } from "@tanstack/react-query";
import { Modal } from "../../shared/ui/Modal";
import { Button } from "../../shared/ui/Button";
import { LoadingState, ErrorState } from "../../shared/ui/States";
import { getDownloadUrl, triggerBrowserDownload, type Document } from "./api";

interface DocumentPreviewModalProps {
  doc: Document;
  onClose: () => void;
}

/**
 * Inline preview for "Visualizar" — a real production implementation, not a
 * mock-only placeholder: PDFs render via <iframe>, images via <img>, and any
 * other content-type falls back to a "no preview" message with an in-modal
 * download button. Against the current MSW mock (empty `data:` URL) this
 * will render blank/broken, by design — per UXFIX-13..19, no fake bytes were
 * added to the fixtures; this becomes fully functional once a real backend
 * serves real files.
 */
export function DocumentPreviewModal({ doc, onClose }: DocumentPreviewModalProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["documents", doc.id, "download"],
    queryFn: () => getDownloadUrl(doc.id),
  });

  const isPdf = doc.contentType === "application/pdf";
  const isImage = doc.contentType.startsWith("image/");

  return (
    <Modal title={doc.fileName} onClose={onClose} width={720}>
      {isLoading && <LoadingState label="Carregando pré-visualização..." />}
      {isError && <ErrorState label="Não foi possível carregar a pré-visualização. Tente novamente." />}
      {!isLoading && !isError && data && (
        <>
          {isPdf && (
            <iframe title={doc.fileName} src={data.url} style={{ width: "100%", height: "70vh", border: "none" }} />
          )}
          {!isPdf && isImage && (
            <img
              src={data.url}
              alt={doc.fileName}
              style={{ maxWidth: "100%", maxHeight: "70vh", display: "block", margin: "0 auto" }}
            />
          )}
          {!isPdf && !isImage && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 16 }}>
                Pré-visualização não disponível para este tipo de arquivo.
              </p>
              <Button variant="primary" onClick={() => triggerBrowserDownload(data.url, doc.fileName)}>
                Baixar arquivo
              </Button>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
