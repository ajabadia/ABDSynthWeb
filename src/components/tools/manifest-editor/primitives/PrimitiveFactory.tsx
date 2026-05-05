'use client';

import React from 'react';
import Knob from './Knob';
import Port from './Port';
import Display from './Display';
import Led from './Led';
import Switch from './Switch';
import Slider from './Slider';
import Stepper from './Stepper';
import Label from './Label';

import Select from './Select';
import Scope from './SignalScope';
import Terminal from './Terminal';

import { ManifestEntity } from '@/types/manifest';


interface PrimitiveProps {
  type: string;
  value: number;
  steps: number;
  variant: string;
  skin: string;
  isMain?: boolean;
  isSelected?: boolean;
  onValueChange: (val: number) => void;
  onClick?: () => void;
  text?: string;
  role?: string;
  options?: string[];
  lookup?: string;
  item?: ManifestEntity;
}

export default function PrimitiveFactory(props: PrimitiveProps) {
  const { type, item, ...rest } = props;

  switch (type) {
    case 'knob':
      return <Knob {...rest} />;
    case 'port':
      return <Port {...rest} item={item} />;
    case 'display':
      return <Display {...rest} />;
    case 'select':
      return <Select {...rest} />;
    case 'led':
      return <Led {...rest} />;
    case 'switch':
      return <Switch {...rest} />;
    case 'slider-v':
    case 'slider-h':
      return <Slider {...rest} type={type} />;
    case 'stepper':
    case 'button':
    case 'push':
      return <Stepper {...rest} type={type} />;
    case 'label':
      return <Label {...rest} text={props.text || 'LABEL'} />;
    case 'scope':
      return (
        <Scope 
          {...rest} 
          width={item?.presentation?.size?.w || 120} 
          height={item?.presentation?.size?.h || 60} 
          variant={props.variant as 'phosphor' | 'amber' | 'cyan' | 'oled'}
          color={item?.presentation?.color}
        />
      );
    case 'terminal':
    case 'monitor':
    case 'console':
      return (
        <Terminal 
          {...rest} 
          width={item?.presentation?.size?.w || 140} 
          height={item?.presentation?.size?.h || 90} 
          variant={props.variant as 'phosphor' | 'amber' | 'cyan'}
          text={props.text}
          color={item?.presentation?.color}
          fontFamily={item?.presentation?.font}
        />
      );
    default:
      return <Label {...rest} text={props.text || 'UNKNOWN'} />;
  }
}
