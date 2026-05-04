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
  onClick?: () => void;
  text?: string;
  role?: string;
  options?: string[];
  lookup?: string;
  item?: any;
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
    default:
      return <Label {...rest} text={props.text || 'UNKNOWN'} />;
  }
}
