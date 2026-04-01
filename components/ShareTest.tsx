import React, { useState, useRef, useCallback } from 'react'
import { toast } from 'sonner'
import { Check, Share2, X } from 'lucide-react'

const products = [
    {
        title: 'First product',
        description: 'First product description',
        url: 'https://useinspirely.vercel.app',
        image: '/apple-6.png'
    },
    {
        title: 'Second product',
        description: 'Second product description',
        url: 'https://useinspirely.vercel.app',
        image: '/apple-7.png'
    }
]

const ShareTest = () => {
    const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);

    const toggleSelection = (index: number) => {
        setSelectedIndices((prev) => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            if (next.size === 0) setIsSelectionMode(false);
            return next;
        });
    };

    const handleTouchStart = (index: number) => {
        longPressTimer.current = setTimeout(() => {
            setIsSelectionMode(true);
            toggleSelection(index);
        }, 600);
    };

    const handleTouchEnd = () => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };

    const fetchImageAsFile = async (imageUrl: string, filename: string) => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            return new File([blob], filename, { type: blob.type });
        } catch (error) {
            console.error('Error fetching image:', error);
            return null;
        }
    };

    const handleShareItem = async (p: typeof products[0]) => {
        if (navigator.share) {
            try {
                const file = await fetchImageAsFile(p.image, 'product.png');
                const shareData: ShareData = {
                    title: p.title,
                    text: p.description,
                    url: p.url,
                };
                
                if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
                    shareData.files = [file];
                }

                await navigator.share(shareData);
                toast.success('Shared successfully!');
            } catch (err) {
                if ((err as Error).name !== 'AbortError') {
                    toast.error('Error sharing product');
                }
            }
        } else {
            navigator.clipboard.writeText(p.url);
            toast.success('Product link copied to clipboard');
        }
    };

    const handleBatchShare = async () => {
        const selected = Array.from(selectedIndices).map(idx => products[idx]);
        if (selected.length === 0) return;

        toast.info(`Preparing to share ${selected.length} products...`);

        try {
            const files = await Promise.all(
                selected.map((p, i) => fetchImageAsFile(p.image, `product-${i}.png`))
            );
            
            const validFiles = files.filter((f): f is File => f !== null);

            if (navigator.share && validFiles.length > 0) {
                const shareData: ShareData = {
                    files: validFiles,
                };

                if (navigator.canShare && navigator.canShare(shareData)) {
                    await navigator.share(shareData);
                    toast.success('Shared successfully!');
                } else {
                    toast.error('The browser does not support sharing multiple files.');
                }
            } else if (validFiles.length === 0) {
                toast.error('Could not load product images to share.');
            }
        } catch (err) {
            if ((err as Error).name !== 'AbortError') {
                toast.error('Error sharing products');
            }
        }

        setSelectedIndices(new Set());
        setIsSelectionMode(false);
    };

    return (
        <div className='w-full flex flex-col gap-6 p-4'>
            {isSelectionMode && (
                <div className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-800 p-4 rounded-xl animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center gap-3">
                        <button onClick={() => { setIsSelectionMode(false); setSelectedIndices(new Set()); }} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors">
                            <X className="size-5" />
                        </button>
                        <span className="font-medium">{selectedIndices.size} selected</span>
                    </div>
                    <button 
                        onClick={handleBatchShare}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all active:scale-95"
                    >
                        <Share2 className="size-4" />
                        Share Selected
                    </button>
                </div>
            )}

            <div className='flex flex-wrap gap-10'>
                {products.map((p, index) => {
                    const isSelected = selectedIndices.has(index);
                    
                    const handleClick = () => {
                        if (isSelectionMode) {
                            toggleSelection(index);
                        } else {
                            handleShareItem(p);
                        }
                    };

                    return (
                        <div 
                            key={index}
                            onClick={handleClick}
                            onMouseDown={() => handleTouchStart(index)}
                            onMouseUp={handleTouchEnd}
                            onMouseLeave={handleTouchEnd}
                            onTouchStart={() => handleTouchStart(index)}
                            onTouchEnd={handleTouchEnd}
                            className={`relative size-[300px] overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 ring-offset-2 ${
                                isSelected ? 'ring-4 ring-blue-500 scale-[0.98]' : 'hover:scale-[1.02] shadow-lg'
                            }`}
                        >
                            <img className='w-full h-full object-cover' src={p.image} alt={p.title} />
                            
                            {isSelectionMode && (
                                <div className={`absolute top-4 right-4 size-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    isSelected ? 'bg-blue-500 border-blue-500' : 'bg-black/20 border-white'
                                }`}>
                                    {isSelected && <Check className="size-4 text-white" />}
                                </div>
                            )}
                            
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-black/80 to-transparent text-white">
                                <h3 className="font-bold text-lg">{p.title}</h3>
                                <p className="text-sm opacity-80 truncate">{p.description}</p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default ShareTest