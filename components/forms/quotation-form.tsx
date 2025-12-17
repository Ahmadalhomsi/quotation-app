'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Calculator, GripVertical } from 'lucide-react'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
    useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { CreateCustomerModal } from '@/components/modals/create-customer-modal'
import { CreateProductModal } from '@/components/modals/create-product-modal'
import { CustomerAutocomplete } from '@/components/ui/customer-autocomplete'
import { ProductAutocomplete } from '@/components/ui/product-autocomplete'
import {
    Currency,
    CreateQuotationData,
    CreateQuotationItemData
} from '@/lib/types'
import { currencyService } from '@/lib/currency'

// Types for API data
interface Customer {
    id: string
    companyName: string
    contactName: string
    email?: string
}

interface Product {
    id: string
    name: string
    price: number
    currency: Currency
    description?: string
    kdvRate: number
}

interface QuotationItem extends CreateQuotationItemData {
    id: string
    product?: Product
    totalPrice: number
    discount?: number
    kdvRate: number
}

interface QuotationFormProps {
    mode: 'create' | 'edit'
    initialData?: Partial<CreateQuotationData>
    initialItems?: QuotationItem[]
    initialKdvEnabled?: boolean
    initialKdvRate?: number
    initialExchangeRate?: number
    initialTotalDiscount?: number
    initialShowProductKdv?: boolean
    onSubmit: (data: CreateQuotationData, items: QuotationItem[], kdvEnabled: boolean, kdvRate: number, exchangeRate: number, totalDiscount: number, showProductKdv: boolean) => Promise<void>
    customers: Customer[]
    products: Product[]
    onCustomerCreated: (customer: Customer) => void
    onProductCreated: (product: Product) => void
    isLoading?: boolean
}

// Sortable Table Row Component
function SortableTableRow({ 
    item, 
    index, 
    updateItemQuantity, 
    updateItemUnitPrice, 
    updateItemDiscount, 
    removeItem,
    showProductKdv 
}: {
    item: QuotationItem
    index: number
    updateItemQuantity: (index: number, quantity: number) => void
    updateItemUnitPrice: (index: number, unitPrice: number) => void
    updateItemDiscount: (index: number, discount: number) => void
    removeItem: (index: number) => void
    showProductKdv: boolean
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <TableRow ref={setNodeRef} style={style} className={isDragging ? 'bg-gray-50' : ''}>
            <TableCell>
                <div className="flex items-center space-x-2">
                    <button
                        type="button"
                        className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
                        {...attributes}
                        {...listeners}
                    >
                        <GripVertical className="h-4 w-4 text-gray-400" />
                    </button>
                    <div>
                        <div className="font-medium">{item.product?.name}</div>
                    </div>
                </div>
            </TableCell>
            <TableCell className="text-center">
                <div className="flex justify-center">
                    <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                            }
                        }}
                        className="w-20 text-center"
                    />
                </div>
            </TableCell>
            <TableCell className="text-right">
                <div className="flex justify-end">
                    <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItemUnitPrice(index, parseFloat(e.target.value) || 0)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                            }
                        }}
                        className="w-24 text-right"
                    />
                    <span className="ml-1 flex items-center">
                        {item.currency === Currency.TL ? '₺' : '$'}
                    </span>
                </div>
            </TableCell>
            <TableCell className="text-center">
                <div className="flex justify-center">
                    <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={item.discount ?? 0}
                        onChange={(e) => {
                            const value = parseFloat(e.target.value)
                            updateItemDiscount(index, isNaN(value) ? 0 : value)
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                            }
                        }}
                        className="w-20 text-center"
                        placeholder="0"
                    />
                </div>
            </TableCell>
            {showProductKdv && (
                <TableCell className="text-center">
                    <Badge variant="outline">
                        %{Number(item.kdvRate || 20).toFixed(0)}
                    </Badge>
                </TableCell>
            )}
            <TableCell className="text-right">
                {item.currency === Currency.TL ? '₺' : '$'}{item.totalPrice.toFixed(2)}
            </TableCell>
            <TableCell className="text-center">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-700"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </TableCell>
        </TableRow>
    )
}

export function QuotationForm({
    mode,
    initialData = {},
    initialItems = [],
    initialKdvEnabled = true,
    initialKdvRate = 20,
    initialExchangeRate = 30,
    initialTotalDiscount = 0,
    initialShowProductKdv = true,
    onSubmit,
    customers,
    products,
    onCustomerCreated,
    onProductCreated,
    isLoading = false
}: QuotationFormProps) {
    // Default terms and conditions
    const defaultTerms = `-Geçerlilik Süresi
Teklif kabul edildikten sonra geçerlilik süresi 15 gündür.

-Ödeme Koşulları
İşe başlanması için toplam bedelin %50'si peşinat olarak alınır.
Kalan %50'lik bakiye, iş tesliminde nakit veya kredi/banka kartı ile ödenir.

-Garanti Şartları
Teslim edilen ürünlerin garantisi, teslim tarihinden itibaren 2 yıl geçerlidir.
Kullanıcı hataları ve elektrik kaynaklı arızalar garanti kapsamı dışındadır.`

    const normalizeExchangeRate = (value: number | string | null | undefined) => {
        const numeric = Number(value)
        return Number.isFinite(numeric) ? numeric : 30
    }

    const [exchangeRate, setExchangeRate] = useState<number>(() => normalizeExchangeRate(initialExchangeRate))
    const [kdvEnabled, setKdvEnabled] = useState<boolean>(initialKdvEnabled)
    const [kdvRate, setKdvRate] = useState<number>(initialKdvRate)
    const [totalDiscount, setTotalDiscount] = useState<number>(initialTotalDiscount)
    const [showProductKdv, setShowProductKdv] = useState<boolean>(initialShowProductKdv)

    const [formData, setFormData] = useState<CreateQuotationData>({
        title: initialData.title || 'Teklif',
        description: initialData.description || '',
        validUntil: initialData.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        customerId: initialData.customerId || '',
        items: [],
        terms: initialData.terms || defaultTerms,
        notes: initialData.notes || ''
    })

    const [items, setItems] = useState<QuotationItem[]>(initialItems)
    const [newItem, setNewItem] = useState<Partial<QuotationItem>>({
        productId: '',
        quantity: 1,
        unitPrice: 0,
        currency: Currency.TL,
        discount: 0
    })
    
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])

    const [errors, setErrors] = useState<Record<string, string>>({})

    // Drag and drop sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    // Handle drag end
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (active.id !== over?.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id)
                const newIndex = items.findIndex((item) => item.id === over?.id)

                return arrayMove(items, oldIndex, newIndex)
            })
        }
    }
    useEffect(() => {
        if (mode === 'create') {
            const fetchExchangeRate = async () => {
                try {
                    const rate = await currencyService.getUsdToTryRate()
                    setExchangeRate(rate)
                } catch (error) {
                    console.error('Döviz kuru alınamadı:', error)
                    // Keep default rate
                }
            }
            fetchExchangeRate()
        }
    }, [mode])

    useEffect(() => {
        // Ensure prop changes (or string values) are normalized into a number
        setExchangeRate(normalizeExchangeRate(initialExchangeRate))
    }, [initialExchangeRate])

    // Enhanced callback handlers that auto-select newly created items
    const handleCustomerCreated = (customer: Customer) => {
        onCustomerCreated(customer)
        // Auto-select the newly created customer
        setFormData(prev => ({ ...prev, customerId: customer.id }))
        // Clear any customer-related errors
        setErrors(prev => {
            const newErrors = { ...prev }
            delete newErrors.customerId
            return newErrors
        })
    }

    const handleProductCreated = (product: Product) => {
        onProductCreated(product)
        // Auto-select the newly created product
        setNewItem(prev => ({
            ...prev,
            productId: product.id,
            unitPrice: Number(product.price),
            currency: product.currency
        }))
        // Clear any product-related errors
        setErrors(prev => {
            const newErrors = { ...prev }
            delete newErrors.items
            return newErrors
        })
    }

    const handleProductSelect = (productId: string | string[]) => {
        if (Array.isArray(productId)) {
            // Multiple selection
            setSelectedProductIds(productId)
            
            // If switching to multiple products, keep the currency and other settings in newItem
            // Don't override currency - let user's selection persist
            if (productId.length > 0 && !newItem.productId) {
                // If no unit price set yet, could optionally set from first product
                // but we'll let the user's form values persist
            }
        } else {
            // Single selection (legacy mode)
            // Clear multiple selection
            setSelectedProductIds([])
            
            const product = products.find(p => p.id === productId)
            if (product) {
                setNewItem(prev => ({
                    ...prev,
                    productId,
                    unitPrice: Number(product.price),
                    currency: product.currency
                }))
            }
        }
    }

    const addItem = () => {
        // Check if we have multiple products selected
        if (selectedProductIds.length > 0) {
            // Add multiple products
            const newItems: QuotationItem[] = selectedProductIds.map(productId => {
                const product = products.find(p => p.id === productId)
                if (!product) return null
                
                // Use the user-selected currency from the form
                // If user hasn't modified the unit price (it's 0), use the product's price
                // Otherwise use the user-specified unit price
                const selectedCurrency = newItem.currency || Currency.TL
                const selectedUnitPrice = (newItem.unitPrice && newItem.unitPrice > 0) 
                    ? newItem.unitPrice 
                    : Number(product.price)
                
                const discountMultiplier = 1 - ((newItem.discount || 0) / 100)
                const totalPrice = (newItem.quantity || 1) * selectedUnitPrice * discountMultiplier

                return {
                    id: `temp-${Date.now()}-${productId}`,
                    productId,
                    quantity: newItem.quantity || 1,
                    unitPrice: selectedUnitPrice,
                    currency: selectedCurrency,
                    discount: newItem.discount || 0,
                    kdvRate: product.kdvRate || 20,
                    totalPrice,
                    product
                }
            }).filter(Boolean) as QuotationItem[]

            setItems(prev => [...prev, ...newItems])
            setSelectedProductIds([])
            setNewItem({
                productId: '',
                quantity: 1,
                unitPrice: 0,
                currency: Currency.TL,
                discount: 0
            })
            setErrors({})
            return
        }

        // Single product mode (legacy)
        if (!newItem.productId || !newItem.quantity || !newItem.unitPrice) {
            setErrors({ items: 'Lütfen tüm ürün bilgilerini doldurun' })
            return
        }

        const product = products.find(p => p.id === newItem.productId)
        if (!product) return

        const discountMultiplier = 1 - ((newItem.discount || 0) / 100)
        const totalPrice = (newItem.quantity || 1) * (newItem.unitPrice || 0) * discountMultiplier

        const itemToAdd: QuotationItem = {
            id: `temp-${Date.now()}`,
            productId: newItem.productId!,
            quantity: newItem.quantity || 1,
            unitPrice: newItem.unitPrice || 0,
            currency: newItem.currency || Currency.TL,
            discount: newItem.discount || 0,
            kdvRate: product.kdvRate || 20,
            totalPrice,
            product
        }

        setItems(prev => [...prev, itemToAdd])
        setNewItem({
            productId: '',
            quantity: 1,
            unitPrice: 0,
            currency: Currency.TL,
            discount: 0
        })
        setErrors({})
    }

    const removeItem = (index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index))
    }

    const updateItemQuantity = (index: number, newQuantity: number) => {
        setItems(prev => prev.map((item, i) => {
            if (i === index) {
                const discountMultiplier = 1 - ((item.discount || 0) / 100)
                const totalPrice = newQuantity * item.unitPrice * discountMultiplier
                return { ...item, quantity: newQuantity, totalPrice }
            }
            return item
        }))
    }

    const updateItemDiscount = (index: number, newDiscount: number) => {
        setItems(prev => {
            const updated = prev.map((item, i) => {
                if (i === index) {
                    const discountMultiplier = 1 - (newDiscount / 100)
                    const totalPrice = item.quantity * item.unitPrice * discountMultiplier
                    return { ...item, discount: newDiscount, totalPrice }
                }
                return item
            })
            return updated
        })
    }

    const updateItemUnitPrice = (index: number, newUnitPrice: number) => {
        setItems(prev => prev.map((item, i) => {
            if (i === index) {
                const discountMultiplier = 1 - ((item.discount || 0) / 100)
                const totalPrice = item.quantity * newUnitPrice * discountMultiplier
                return { ...item, unitPrice: newUnitPrice, totalPrice }
            }
            return item
        }))
    }

    const calculateTotals = () => {
        // Calculate subtotals and KDV per item
        const totals = items.reduce((acc, item) => {
            const itemTotal = item.totalPrice
            const itemKdvRate = item.kdvRate || 20
            const itemKdvAmount = kdvEnabled ? itemTotal * (itemKdvRate / 100) : 0
            const itemWithKdv = itemTotal + itemKdvAmount
            
            if (item.currency === Currency.TL) {
                acc.subtotalTL += itemTotal
                acc.kdvAmountTL += itemKdvAmount
                acc.totalTL += itemWithKdv
            } else {
                acc.subtotalUSD += itemTotal
                acc.kdvAmountUSD += itemKdvAmount
                acc.totalUSD += itemWithKdv
            }
            return acc
        }, { totalTL: 0, totalUSD: 0, subtotalTL: 0, subtotalUSD: 0, kdvAmountTL: 0, kdvAmountUSD: 0 })

        // Apply total discount
        const discountMultiplier = 1 - (totalDiscount / 100)
        
        return {
            totalTL: totals.totalTL * discountMultiplier,
            totalUSD: totals.totalUSD * discountMultiplier,
            subtotalTL: totals.subtotalTL,
            subtotalUSD: totals.subtotalUSD,
            kdvAmountTL: totals.kdvAmountTL * discountMultiplier,
            kdvAmountUSD: totals.kdvAmountUSD * discountMultiplier,
            discountAmountTL: totals.totalTL * (totalDiscount / 100),
            discountAmountUSD: totals.totalUSD * (totalDiscount / 100)
        }
    }

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!formData.title.trim()) {
            newErrors.title = 'Teklif başlığı gereklidir'
        }

        if (!formData.customerId) {
            newErrors.customerId = 'Müşteri seçmelisiniz'
        }

        if (items.length === 0) {
            newErrors.items = 'En az bir ürün eklemelisiniz'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        await onSubmit(formData, items, kdvEnabled, kdvRate, exchangeRate, totalDiscount, showProductKdv)
    }

    const totals = calculateTotals()

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Temel Bilgiler */}
            <Card>
                <CardHeader>
                    <CardTitle>Temel Bilgiler</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="title">Teklif Başlığı *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => {
                                    setFormData(prev => ({ ...prev, title: e.target.value }))
                                    // Clear title error when user starts typing
                                    if (e.target.value.trim()) {
                                        setErrors(prev => {
                                            const newErrors = { ...prev }
                                            delete newErrors.title
                                            return newErrors
                                        })
                                    }
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                                placeholder="Örn: POS Sistemi Teklifi"
                                className={errors.title ? 'border-red-500' : ''}
                            />
                            {errors.title && (
                                <p className="text-sm text-red-500">{errors.title}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Müşteri</Label>
                            <CustomerAutocomplete
                                customers={customers}
                                value={formData.customerId}
                                onSelect={(customerId) => {
                                    setFormData(prev => ({ ...prev, customerId }))
                                    // Clear customer error when a customer is selected
                                    setErrors(prev => {
                                        const newErrors = { ...prev }
                                        delete newErrors.customerId
                                        return newErrors
                                    })
                                }}
                                onCreateNew={() => {
                                    // You can trigger the create customer modal here
                                    // For now, we'll keep the existing modal approach
                                }}
                                showCreateButton={false} // We'll keep the existing modal
                                error={!!errors.customerId}
                            />
                            {mode === 'create' && (
                                <div className="flex justify-start">
                                    <CreateCustomerModal onCustomerCreated={handleCustomerCreated} />
                                </div>
                            )}
                            {errors.customerId && (
                                <p className="text-sm text-red-500">{errors.customerId}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Açıklama</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                }
                            }}
                            placeholder="Teklif hakkında detaylı açıklama..."
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="validUntil">Geçerlilik Tarihi</Label>
                        <Input
                            id="validUntil"
                            type="date"
                            value={formData.validUntil instanceof Date
                                ? formData.validUntil.toISOString().split('T')[0]
                                : new Date(formData.validUntil).toISOString().split('T')[0]
                            }
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                validUntil: new Date(e.target.value)
                            }))}
                            onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* KDV ve Kur Ayarları */}
            <Card>
                <CardHeader>
                    <CardTitle>KDV ve Kur Ayarları</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="kdvEnabled"
                                checked={kdvEnabled}
                                onChange={(e) => setKdvEnabled(e.target.checked)}
                                className="rounded border-gray-300"
                            />
                            <Label htmlFor="kdvEnabled">KDV Dahil</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="showProductKdv"
                                checked={showProductKdv}
                                onChange={(e) => setShowProductKdv(e.target.checked)}
                                className="rounded border-gray-300"
                            />
                            <Label htmlFor="showProductKdv">Ürün KDV Oranlarını Göster</Label>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="kdvRate">Genel KDV Oranı (%)</Label>
                            <Input
                                id="kdvRate"
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={kdvRate}
                                onChange={(e) => setKdvRate(Number(e.target.value))}
                                onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                                disabled={!kdvEnabled}
                            />
                            <p className="text-xs text-muted-foreground">Her ürün kendi KDV oranına sahiptir</p>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="exchangeRate">Döviz Kuru (USD/TL)</Label>
                            <Input
                                id="exchangeRate"
                                type="number"
                                min="0"
                                step="0.0001"
                                value={exchangeRate}
                                onChange={(e) => setExchangeRate(Number(e.target.value))}
                                onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="totalDiscount">Toplam İskonto (%)</Label>
                            <Input
                                id="totalDiscount"
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={totalDiscount}
                                onChange={(e) => setTotalDiscount(Number(e.target.value))}
                                onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                                placeholder="0"
                            />
                            <p className="text-xs text-muted-foreground">
                                Tüm teklif toplamı üzerinden uygulanacak iskonto oranı
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Ürün Ekleme */}
            <Card>
                <CardHeader>
                    <CardTitle>Ürün Ekle</CardTitle>
                    <CardDescription>
                        Teklife eklemek istediğiniz ürün veya hizmetleri seçin
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Product Selection Row */}
                    <div className="space-y-2">
                        <Label>Ürün</Label>
                        <ProductAutocomplete
                            products={products}
                            value={selectedProductIds.length > 0 ? selectedProductIds : newItem.productId}
                            onSelect={handleProductSelect}
                            showCreateButton={false} // We'll keep the existing modal
                            multiple={true}
                        />
                        {mode === 'create' && (
                            <div className="flex justify-start mt-2">
                                <CreateProductModal onProductCreated={handleProductCreated} />
                            </div>
                        )}
                    </div>

                    {/* Other Fields Row */}
                    <div className="grid gap-4 md:grid-cols-6">
                        <div className="space-y-2">
                            <Label>Miktar</Label>
                            <Input
                                type="number"
                                min="1"
                                value={newItem.quantity}
                                onChange={(e) => setNewItem(prev => ({
                                    ...prev,
                                    quantity: parseInt(e.target.value) || 1
                                }))}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                    }
                                }}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Birim Fiyat</Label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={newItem.unitPrice}
                                onChange={(e) => setNewItem(prev => ({
                                    ...prev,
                                    unitPrice: parseFloat(e.target.value) || 0
                                }))}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                    }
                                }}
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label>Para Birimi</Label>
                            <Select
                                value={newItem.currency}
                                onValueChange={(value: Currency) => setNewItem(prev => ({
                                    ...prev,
                                    currency: value
                                }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={Currency.TL}>₺ TL</SelectItem>
                                    <SelectItem value={Currency.USD}>$ USD</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>İskonto (%)</Label>
                            <Input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={newItem.discount || 0}
                                onChange={(e) => setNewItem(prev => ({
                                    ...prev,
                                    discount: parseFloat(e.target.value) || 0
                                }))}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                    }
                                }}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>&nbsp;</Label>
                            <Button type="button" onClick={addItem} className="w-full">
                                <Plus className="mr-2 h-4 w-4" />
                                {selectedProductIds.length > 0 
                                    ? `${selectedProductIds.length} Ürünü Ekle`
                                    : 'Ekle'
                                }
                            </Button>
                        </div>
                    </div>

                    {errors.items && (
                        <p className="text-sm text-red-500">{errors.items}</p>
                    )}
                </CardContent>
            </Card>

            {/* Eklenen Ürünler Tablosu */}
            {items.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Eklenen Ürünler</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Ürün</TableHead>
                                        <TableHead className="text-center">Miktar</TableHead>
                                        <TableHead className="text-right">Birim Fiyat</TableHead>
                                        <TableHead className="text-center">İskonto (%)</TableHead>
                                        {showProductKdv && <TableHead className="text-center">KDV (%)</TableHead>}
                                        <TableHead className="text-right">Toplam</TableHead>
                                        <TableHead className="text-center">İşlem</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
                                        {items.map((item, index) => (
                                            <SortableTableRow
                                                key={item.id}
                                                item={item}
                                                index={index}
                                                updateItemQuantity={updateItemQuantity}
                                                updateItemUnitPrice={updateItemUnitPrice}
                                                updateItemDiscount={updateItemDiscount}
                                                removeItem={removeItem}
                                                showProductKdv={showProductKdv}
                                            />
                                        ))}
                                    </SortableContext>
                                </TableBody>
                            </Table>
                        </DndContext>
                    </CardContent>
                </Card>
            )}
            {/* Toplam Hesap */}
            {items.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Calculator className="mr-2 h-5 w-5" />
                            Toplam Hesap
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* TL Totals */}
                            {totals.totalTL > 0 && (
                                <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <h4 className="font-semibold text-lg">Türk Lirası (₺)</h4>
                                    {kdvEnabled && (
                                        <>
                                            <div className="flex justify-between">
                                                <span>Ara Toplam:</span>
                                                <span>₺{totals.subtotalTL.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>KDV (%{kdvRate}):</span>
                                                <span>₺{totals.kdvAmountTL.toFixed(2)}</span>
                                            </div>
                                            <hr />
                                        </>
                                    )}
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>{kdvEnabled ? 'KDV Dahil Toplam:' : 'Toplam:'}</span>
                                        <span>₺{totals.totalTL.toFixed(2)}</span>
                                    </div>
                                    {!kdvEnabled && (
                                        <p className="text-sm text-red-600 font-medium">⚠️ KDV dahil değildir</p>
                                    )}
                                </div>
                            )}

                            {/* USD Totals */}
                            {totals.totalUSD > 0 && (
                                <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <h4 className="font-semibold text-lg">Amerikan Doları ($)</h4>
                                    {kdvEnabled && (
                                        <>
                                            <div className="flex justify-between">
                                                <span>Ara Toplam:</span>
                                                <span>${totals.subtotalUSD.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>KDV (%{kdvRate}):</span>
                                                <span>${totals.kdvAmountUSD.toFixed(2)}</span>
                                            </div>
                                            <hr />
                                        </>
                                    )}
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>{kdvEnabled ? 'KDV Dahil Toplam:' : 'Toplam:'}</span>
                                        <span>${totals.totalUSD.toFixed(2)}</span>
                                    </div>
                                    {!kdvEnabled && (
                                        <p className="text-sm text-red-600 font-medium">⚠️ KDV dahil değildir</p>
                                    )}
                                    <p className="text-sm text-muted-foreground">
                                        Döviz Kuru: {exchangeRate.toFixed(4)} TL/USD
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Şartlar ve Notlar */}
            <Card>
                <CardHeader>
                    <CardTitle>Şartlar ve Notlar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="terms">Şartlar ve Koşullar</Label>
                        <Textarea
                            id="terms"
                            value={formData.terms}
                            onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                }
                            }}
                            placeholder="Teklif ile ilgili şartlar ve koşullar..."
                            rows={4}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notlar</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                }
                            }}
                            placeholder="Dahili notlar ve açıklamalar..."
                            rows={3}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end">
                <Button type="submit" disabled={isLoading} size="lg">
                    {isLoading ? 'İşleniyor...' : mode === 'create' ? 'Teklif Oluştur' : 'Değişiklikleri Kaydet'}
                </Button>
            </div>
        </form>
    )
}