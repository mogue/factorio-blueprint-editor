import * as PIXI from 'pixi.js'
import G from '../../../common/globals'
import { Entity } from '../../../core/Entity'
import { Slot } from '../../controls/Slot'
import F from '../../controls/functions'

/** Module Slots for Entity */
export class Modules extends PIXI.Container {
    /** Blueprint Editor Entity reference */
    private readonly m_Entity: Entity

    /** Field to hold data for module visualization */
    private readonly m_Modules: string[]

    public constructor(entity: Entity) {
        super()

        // Store entity data reference for later usage
        this.m_Entity = entity

        // Get modules from entity
        this.m_Modules = new Array(this.m_Entity.moduleSlots)
        const modules = this.m_Entity.modules
        if (modules !== undefined) {
            for (let slotIndex = 0; slotIndex < this.m_Modules.length; slotIndex++) {
                this.m_Modules[slotIndex] =
                    modules.length > slotIndex && modules[slotIndex] !== undefined
                        ? modules[slotIndex]
                        : undefined
            }
        }

        // Create slots for entity
        for (let slotIndex = 0; slotIndex < this.m_Modules.length; slotIndex++) {
            const slot: Slot = new Slot()
            slot.position.set(slotIndex * 38, 0)
            slot.data = slotIndex
            slot.on('pointerdown', (e: PIXI.InteractionEvent) => this.onSlotPointerDown(e))
            if (this.m_Modules[slotIndex] !== undefined) {
                slot.content = F.CreateIcon(this.m_Modules[slotIndex])
            }
            this.addChild(slot)
        }

        this.onEntityChange('modules', modules =>
            [
                ...modules,
                ...Array(this.m_Entity.moduleSlots - modules.length).fill(undefined),
            ].forEach((m: string, i: number) => {
                this.m_Modules[i] = m
                this.updateContent(this.getChildAt(i) as Slot, m)
            })
        )
    }

    private onEntityChange(event: string, fn: (...args: any[]) => void): void {
        this.m_Entity.on(event, fn)
        this.once('destroy', () => this.m_Entity.off(event, fn))
    }

    public destroy(opts?: boolean | PIXI.IDestroyOptions): void {
        this.emit('destroy')
        super.destroy(opts)
    }

    /** Update Content Icon */
    private updateContent(slot: Slot, module: string): void {
        if (module === undefined) {
            if (slot.content !== undefined) {
                slot.content = undefined
            }
        } else {
            slot.content = F.CreateIcon(module)
        }
        this.emit('changed')
    }

    /** Event handler for click on slot */
    private onSlotPointerDown(e: PIXI.InteractionEvent): void {
        e.stopPropagation()
        const slot: Slot = e.target as Slot
        const index: number = slot.data as number
        if (e.data.button === 0) {
            G.UI.createInventory('Select Module', this.m_Entity.acceptedModules, name => {
                this.m_Modules[index] = name
                this.m_Entity.modules = this.m_Modules
            })
        } else if (e.data.button === 2) {
            this.m_Modules[index] = undefined
            this.m_Entity.modules = this.m_Modules
        }
    }
}
