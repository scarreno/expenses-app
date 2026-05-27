'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { IconCircleDashedMinus } from "@tabler/icons-react";
import { toast } from "sonner";

type Props = {
  receiptId: string
}

export function DeleteReceiptButton({ receiptId }: Props) {
  const router = useRouter()

  const handleDeleteReceipt = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this receipt?'
    )

    if (!confirmed) return

    try {
      const response = await fetch(`/api/receipts/${receiptId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete receipt')
      }

      toast.success('Receipt deleted successfully')

      router.push('/receipts')
      router.refresh()
    } catch (error) {
      console.error(error)

      toast.error('Failed to delete receipt')
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="border-red-900/60 text-red-400 hover:bg-red-950 hover:text-red-200"
      onClick={handleDeleteReceipt}
    >
      <IconCircleDashedMinus className="mr-2 size-4" />
      Delete Receipt
    </Button>
  )
}