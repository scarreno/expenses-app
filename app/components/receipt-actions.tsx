import { IconDeviceFloppy } from "@tabler/icons-react";
import { IconPlus } from "@tabler/icons-react";

import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

type Props = {
    addItem: () => void,
    handleSave: () => void,
    saving: boolean
}



export function ReceiptActions({ 
        addItem,
        handleSave,
        saving
    }: Props){
        return(
            <div
              style={{
                display: "flex",
                gap: 12,
                marginTop: 24,
              }}
            >
              <Button type="button" 
                      variant="outline"
                      onClick={addItem}
              >
              <IconPlus className="mr-2 size-4" />

                Add item
              </Button>

              <Button type="button" 
                  onClick={handleSave} 
                  variant="outline"
                  disabled={saving}>
                {saving ? (
                      <>
                        <Spinner className="mr-2 size-4" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <IconDeviceFloppy className="mr-2 size-4" />
                        Save receipt
                      </>
                    )
                }
              </Button>
            </div>
        );
    }