'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from './Skeleton';

const LocationPickerHelper = dynamic(() => import('./LocationPickerHelper'), {
    loading: () => (
        <div className="w-full h-[400px] bg-[#111] animate-pulse flex items-center justify-center border border-white/20">
            <span className="text-white/30 font-mono">LOADING MAP MODULE...</span>
        </div>
    ),
    ssr: false
});

export default function LocationPicker(props: any) {
    return <LocationPickerHelper {...props} />;
}
