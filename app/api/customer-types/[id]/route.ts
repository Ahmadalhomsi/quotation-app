import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET - Fetch specific customer type
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    try {
        const customerType = await prisma.customerType.findUnique({
            where: { id }
        })

        if (!customerType) {
            return NextResponse.json(
                { success: false, error: 'Customer type not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            customerType
        })
    } catch (error) {
        console.error('Error fetching customer type:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch customer type' },
            { status: 500 }
        )
    }
}

// PUT - Update customer type
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { name, color, description, category, isActive } = await request.json()
        const { id } = await params

        if (!name) {
            return NextResponse.json(
                { success: false, error: 'Name is required' },
                { status: 400 }
            )
        }

        // Check if name already exists (excluding current type)
        const existingType = await prisma.customerType.findFirst({
            where: {
                name,
                id: { not: id }
            }
        })

        if (existingType) {
            return NextResponse.json(
                { success: false, error: 'A customer type with this name already exists' },
                { status: 400 }
            )
        }

        const customerType = await prisma.customerType.update({
            where: { id },
            data: {
                name,
                color: color || '#6B7280',
                description,
                category: category || 'custom',
                isActive: isActive !== undefined ? isActive : true
            }
        })

        return NextResponse.json({
            success: true,
            customerType
        })
    } catch (error) {
        console.error('Error updating customer type:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update customer type' },
            { status: 500 }
        )
    }
}

// DELETE - Delete customer type
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // Check if type is being used by any customer
        const usageCount = await prisma.customerCustomerType.count({
            where: { typeId: id }
        })

        if (usageCount > 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Cannot delete customer type. It is currently assigned to ${usageCount} customer(s).`
                },
                { status: 400 }
            )
        }

        await prisma.customerType.delete({
            where: { id }
        })

        return NextResponse.json({
            success: true,
            message: 'Customer type deleted successfully'
        })
    } catch (error) {
        console.error('Error deleting customer type:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to delete customer type' },
            { status: 500 }
        )
    }
}