import { create } from "zustand";




type State = {
    assets: string[],
    addAsset: (asset: string) => void,
    removeAsset: (asset: string) => void,
    updateAsset: (asset: string) => void
    setAssets: (assets: string[]) => void
}
export const useSpriEditorStore = create<State>((set) => ({
    assets: [],
    addAsset: (asset: string) => set((state) => ({ assets: [...state.assets, asset] })),
    removeAsset: (asset: string) => set((state) => ({ assets: state.assets.filter((a) => a !== asset) })),
    updateAsset: (asset: string) => set((state) => ({ assets: state.assets.map((a) => a === asset ? asset : a) })),
    setAssets: (assets: string[]) => set(() => ({ assets: assets }))
}))