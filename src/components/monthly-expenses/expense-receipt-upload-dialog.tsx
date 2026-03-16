import { useId, useMemo, useState, type ChangeEvent, type DragEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

import styles from "./expense-receipt-upload-dialog.module.scss";

const FILE_ACCEPT = [
  "application/pdf",
  "image/heic",
  "image/heif",
  "image/jpeg",
  "image/png",
  "image/webp",
].join(",");

interface ExpenseReceiptUploadDialogProps {
  coveredPaymentsMax: number;
  coveredPaymentsRemaining: number;
  errorMessage: string | null;
  expenseDescription: string;
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onUpload: (args: { coveredPayments: number; file: File }) => Promise<void>;
}

function getDroppedFile(event: DragEvent<HTMLDivElement>): File | null {
  const droppedFile = event.dataTransfer.files?.[0];

  return droppedFile ?? null;
}

function formatPaymentCount(count: number): string {
  return `${count} pago${count === 1 ? "" : "s"}`;
}

export function ExpenseReceiptUploadDialog({
  coveredPaymentsMax,
  coveredPaymentsRemaining,
  errorMessage,
  expenseDescription,
  isOpen,
  isSubmitting,
  onClose,
  onUpload,
}: ExpenseReceiptUploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [coverageMode, setCoverageMode] = useState<"full" | "partial">("full");
  const [partialCoveredPayments, setPartialCoveredPayments] = useState("1");
  const inputIdBase = useId();
  const fullCoverageOptionId = `${inputIdBase}-full-coverage`;
  const partialCoverageOptionId = `${inputIdBase}-partial-coverage`;
  const partialCoveredPaymentsInputId = `${inputIdBase}-partial-covered-payments`;

  const normalizedCoveredPaymentsMax = Math.max(coveredPaymentsMax, 1);
  const normalizedCoveredPaymentsRemaining = Math.max(coveredPaymentsRemaining, 1);
  const shouldShowCoverageOptions = normalizedCoveredPaymentsRemaining > 1;
  const parsedPartialCoveredPayments = Number(partialCoveredPayments);
  const partialCoveredPaymentsIsValid =
    Number.isInteger(parsedPartialCoveredPayments) &&
    parsedPartialCoveredPayments > 0 &&
    parsedPartialCoveredPayments <= normalizedCoveredPaymentsMax;

  const dropzoneLabel = useMemo(
    () =>
      expenseDescription.trim().length > 0
        ? `Comprobante para ${expenseDescription.trim()}`
        : "Comprobante del gasto",
    [expenseDescription],
  );

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSelectedFile(null);
      setIsDraggingFile(false);
      setCoverageMode("full");
      setPartialCoveredPayments("1");
      onClose();
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    setSelectedFile(nextFile);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingFile(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingFile(false);
    setSelectedFile(getDroppedFile(event));
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      return;
    }

    const coveredPayments = shouldShowCoverageOptions && coverageMode === "partial"
      ? parsedPartialCoveredPayments
      : normalizedCoveredPaymentsRemaining;

    if (!Number.isInteger(coveredPayments) || coveredPayments <= 0) {
      return;
    }

    await onUpload({
      coveredPayments,
      file: selectedFile,
    });
  };

  return (
    <Dialog onOpenChange={handleDialogOpenChange} open={isOpen}>
      <DialogContent className={styles.dialogContent}>
        <DialogHeader>
          <DialogTitle>Subir comprobante</DialogTitle>
          <DialogDescription>
            Subí un archivo del comprobante y lo vamos a guardar en Google Drive.
          </DialogDescription>
        </DialogHeader>

        <div className={styles.content}>
          <div
            aria-label={dropzoneLabel}
            className={cn(styles.dropzone, isDraggingFile && styles.dropzoneActive)}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            role="region"
          >
            <p className={styles.dropzoneText}>
              Arrastrá y soltá el archivo acá, o seleccioná uno desde tu equipo.
            </p>
            <Input
              accept={FILE_ACCEPT}
              className={styles.fileInput}
              onChange={handleFileChange}
              type="file"
            />
          </div>

          {selectedFile ? (
            <p className={styles.selectedFile}>Archivo: {selectedFile.name}</p>
          ) : null}

          {shouldShowCoverageOptions ? (
            <div className={styles.coverageSection}>
              <p className={styles.coverageTitle}>
                Elegí cómo aplicar este comprobante:
              </p>

              <RadioGroup
                className={styles.coverageOptions}
                onValueChange={(value) => {
                  if (value === "partial") {
                    setCoverageMode("partial");
                    return;
                  }

                  setCoverageMode("full");
                }}
                value={coverageMode}
              >
                <div
                  className={cn(
                    styles.coverageOption,
                    coverageMode === "full" && styles.coverageOptionSelected,
                  )}
                >
                  <div className={styles.coverageOptionHeader}>
                    <RadioGroupItem id={fullCoverageOptionId} value="full" />
                    <Label className={styles.coverageOptionLabel} htmlFor={fullCoverageOptionId}>
                      Todo el periodo
                    </Label>
                  </div>
                  <p className={styles.coverageOptionDescription}>
                    El comprobante cubre {formatPaymentCount(normalizedCoveredPaymentsRemaining)} pendientes de un total de {formatPaymentCount(normalizedCoveredPaymentsMax)} en este mes.
                  </p>
                </div>

                <div
                  className={cn(
                    styles.coverageOption,
                    coverageMode === "partial" && styles.coverageOptionSelected,
                  )}
                >
                  <div className={styles.coverageOptionHeader}>
                    <RadioGroupItem id={partialCoverageOptionId} value="partial" />
                    <Label className={styles.coverageOptionLabel} htmlFor={partialCoverageOptionId}>
                      Cobertura parcial
                    </Label>
                  </div>
                  <p className={styles.coverageOptionDescription}>
                    El comprobante cubre solo la cantidad de pagos que indiques manualmente.
                  </p>
                </div>
              </RadioGroup>

              {coverageMode === "partial" ? (
                <div className={styles.partialCoverageField}>
                  <Label htmlFor={partialCoveredPaymentsInputId}>Cantidad de pagos a cubrir</Label>
                  <Input
                    id={partialCoveredPaymentsInputId}
                    inputMode="numeric"
                    max={normalizedCoveredPaymentsMax}
                    min={1}
                    onChange={(event) =>
                      setPartialCoveredPayments(event.target.value.replace(/[^\d]/g, ""))}
                    type="number"
                    value={partialCoveredPayments}
                  />
                  <p className={styles.coverageHint}>
                    Podés indicar entre 1 y {normalizedCoveredPaymentsMax} pagos.
                  </p>
                </div>
              ) : null}

              {coverageMode === "partial" && !partialCoveredPaymentsIsValid ? (
                <p className={styles.errorText} role="alert">
                  Ingresá una cantidad de pagos válida entre 1 y {normalizedCoveredPaymentsMax}.
                </p>
              ) : null}
            </div>
          ) : null}

          <p className={styles.supportedTypes}>
            Formatos permitidos: PDF, JPG, PNG, WEBP, HEIC, HEIF (hasta 5MB).
          </p>

          {errorMessage ? (
            <p className={styles.errorText} role="alert">
              {errorMessage}
            </p>
          ) : null}

          <div className={styles.actions}>
            <Button
              disabled={isSubmitting}
              onClick={onClose}
              type="button"
              variant="outline"
            >
              Cancelar
            </Button>
            <Button
              disabled={
                !selectedFile ||
                isSubmitting ||
                (shouldShowCoverageOptions &&
                  coverageMode === "partial" &&
                  !partialCoveredPaymentsIsValid)
              }
              onClick={() => {
                void handleUpload();
              }}
              type="button"
            >
              {isSubmitting ? "Subiendo..." : "Subir comprobante"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
