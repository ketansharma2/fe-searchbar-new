// components/common/ResumePreviewModal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Download, Maximize2, Minimize2, X } from "lucide-react";

interface ResumePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  previewUrl: string | null;
  candidateName: string;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isLoading?: boolean;
}

export function ResumePreviewModal({
  open,
  onOpenChange,
  previewUrl,
  candidateName,
  isFullscreen,
  onToggleFullscreen,
  isLoading = false,
}: ResumePreviewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`${
          isFullscreen 
            ? "max-w-[70vw] max-h-[80vh] w-[70vw] h-[80vh] rounded-none m-0"
            : "max-w-5xl w-[70vw] max-h-[80vh] h-[80vh]"
        } p-0 overflow-hidden flex flex-col [&>button]:hidden`}
        style={{ 
          maxWidth: isFullscreen ? '70vw' : '70vw',
          width: isFullscreen ? '70vw' : '70vw',
          maxHeight: isFullscreen ? '80vh' : '80vh',
          height: isFullscreen ? '80vh' : '80vh',
        }}
      >
        <DialogHeader className="flex flex-row items-center justify-between p-4 border-b shrink-0">
          <DialogTitle className="text-lg font-semibold">
            Resume Preview - {candidateName}
          </DialogTitle>
          <div className="flex items-center gap-2">
            {/* <Button
              variant="ghost"
              size="icon"
              onClick={onToggleFullscreen}
              className="h-8 w-8"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button> */}
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900 relative">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Spinner className="h-8 w-8 mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">Loading resume preview...</p>
              </div>
            </div>
          ) : previewUrl ? (
            <iframe
              src={`https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
                previewUrl
              )}`}
              className="w-full h-full border-0"
              title="Resume Preview"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              loading="lazy"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">No resume available</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 p-4 border-t shrink-0 bg-white dark:bg-gray-950">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (previewUrl) {
                window.open(previewUrl, "_blank", "noopener,noreferrer");
              }
            }}
            disabled={!previewUrl}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          {/* <Button
            size="sm"
            onClick={() => {
              if (previewUrl) {
                window.open(
                  `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
                    previewUrl
                  )}`,
                  "_blank",
                  "noopener,noreferrer"
                );
              }
            }}
            disabled={!previewUrl}
          >
            <Maximize2 className="h-4 w-4 mr-2" />
            Open in New Tab
          </Button> */}
        </div>
      </DialogContent>
    </Dialog>
  );
}