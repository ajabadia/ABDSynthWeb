'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Image, Plus, Trash2, FileImage, Globe, ShieldCheck } from 'lucide-react';

interface ResourceSectionProps {
  resources: { name: string, data: ArrayBuffer, type: string }[];
  onTriggerUpload: () => void;
  onRemove?: (name: string) => void;
}

interface ResourceItemProps {
  res: { name: string, data: ArrayBuffer, type: string };
  idx: number;
  onRemove?: (name: string) => void;
}

const ResourceItem = React.memo(({ res, idx, onRemove }: ResourceItemProps) => {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!res.type.startsWith('image/')) return;
    
    const blob = new Blob([res.data], { type: res.type });
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [res.data, res.type]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      className="group p-3 bg-white/2 border border-outline/10 rounded-sm hover:border-primary/20 transition-all flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-black/40 border border-outline/20 rounded-xs flex items-center justify-center overflow-hidden">
          {previewUrl ? (
            <img 
              src={previewUrl} 
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              alt={res.name}
            />
          ) : (
            <FileImage className="w-4 h-4 text-foreground/20" />
          )}
        </div>
        <div>
          <p className="text-[9px] font-black text-foreground/70 group-hover:text-primary transition-colors truncate max-w-[120px]">
            {res.name}
          </p>
          <p className="text-[7px] font-mono text-foreground/30 uppercase tracking-tighter">
            {Math.round(res.data.byteLength / 1024)} KB • {res.type.split('/')[1]}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {res.name.toLowerCase().includes('skin') && (
          <div className="px-1.5 py-0.5 bg-accent/10 border border-accent/20 rounded-xs flex items-center gap-1">
            <ShieldCheck className="w-2.5 h-2.5 text-accent" />
            <span className="text-[6px] font-black uppercase text-accent">Active Skin</span>
          </div>
        )}
        <button 
          onClick={() => onRemove?.(res.name)}
          className="p-1.5 hover:bg-red-500/10 rounded-xs text-foreground/20 hover:text-red-500 transition-all"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
});

export default function ResourceSection({ resources, onTriggerUpload, onRemove }: ResourceSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
            <Image className="w-3.5 h-3.5" />
            Module Assets
          </h3>
          <p className="text-[8px] font-mono text-foreground/30 mt-1">Skins, Images, and Binary Resources</p>
        </div>
        <button 
          onClick={onTriggerUpload}
          className="flex items-center gap-2 px-3 py-1.5 bg-primary text-black rounded-xs hover:scale-105 transition-transform text-[8px] font-black uppercase tracking-widest"
        >
          <Plus className="w-3 h-3" />
          Add Asset
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {resources.length === 0 ? (
          <div className="p-8 border border-dashed border-outline/20 rounded-sm flex flex-col items-center justify-center opacity-40">
            <FileImage className="w-8 h-8 mb-3 text-foreground/20" />
            <p className="text-[8px] font-mono uppercase tracking-widest text-center">No assets in workspace</p>
            <p className="text-[6px] font-mono opacity-40 mt-2">Assets will be stored in resources/ folder</p>
          </div>
        ) : (
          resources.map((res, idx) => (
            <ResourceItem 
              key={res.name} 
              res={res} 
              idx={idx} 
              onRemove={onRemove} 
            />
          ))
        )}
      </div>

      <div className="p-3 bg-black/40 border border-outline/10 rounded-sm">
        <div className="flex items-start gap-3">
          <Globe className="w-4 h-4 text-primary/40 shrink-0" />
          <div>
            <p className="text-[8px] font-black uppercase tracking-widest text-foreground/60 mb-1">Engine Tunnel Access</p>
            <p className="text-[7px] font-mono text-foreground/30 leading-relaxed">
              These assets are automatically served via <span className="text-primary/40">AceCatalog::getResourceStream</span>. 
              Refer to them in your manifest using the path <span className="text-accent/60">"resources/{filename}"</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
