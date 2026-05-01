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

interface PrimitiveProps {
  type: string;
  value: number;
  steps: number;
  variant: string;
  skin: string;
  isMain?: boolean;
  isSelected?: boolean;
  onValueChange: (val: number) => void;
  onClick: () => void;
  text?: string;
  role?: string;
  options?: string[];
  lookup?: string;
}

export default function PrimitiveFactory(props: PrimitiveProps) {
  const { type } = props;

  switch (type) {
    case 'knob':
      return <Knob {...props} />;
    case 'port':
      return <Port {...props} />;
    case 'display':
      return <Display {...props} />;
    case 'select':
      return <Select {...props} />;
    case 'led':
      return <Led {...props} />;
    case 'switch':
      return <Switch {...props} />;
    case 'slider-v':
    case 'slider-h':
      return <Slider {...props} type={type} />;
    case 'stepper':
    case 'button':
    case 'push':
      return <Stepper {...props} type={type} />;
    case 'label':
      return <Label {...props} text={props.text || 'LABEL'} />;
    default:
      return <Label {...props} text={props.text || 'UNKNOWN'} />;
  }
}
