import React from 'react'
import { CheckIcon, CopyIcon } from 'lucide-react'
import { IconButton } from './ui/icon-button'
import { WebhooksList } from './webhooks-list'
import { getApiUrl } from '@/lib/env'

export function Sidebar() {
	const [isCopied, setIsCopied] = React.useState(false)
	const captureUrl = getApiUrl('/api/capture')
	const fullCaptureUrl = captureUrl.startsWith('http') ? captureUrl : `${window.location.origin}${captureUrl}`

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(fullCaptureUrl)
			setIsCopied(true)
			setTimeout(() => {
				setIsCopied(false)
			}, 2000)
		} catch (error) {
			console.error('Failed to copy URL:', error)
		}
	}

	return (
		<div className="flex h-screen flex-col">
			<div className="flex items-center justify-between border-b border-zinc-700 px-4 py-5">
				<div className="flex items-baseline">
					<span className="font-semibold text-zinc-100">webhook</span>
					<span className="font-normal text-zinc-400">.inspect</span>
				</div>
			</div>
			<div className="flex items-center gap-2 border-b border-zinc-700 bg-zinc-800 px-4 py-2.5">
				<div className="flex-1 min-w-0 flex items-center gap-1 text-xs font-mono text-zinc-200">
					<span className="truncate">{fullCaptureUrl}</span>
				</div>
				<IconButton
					icon={isCopied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
					onClick={handleCopy}
				/>
			</div>
			<React.Suspense fallback={<p>Carregando...</p>}>
				<WebhooksList />
			</React.Suspense>
		</div>
	)
}
