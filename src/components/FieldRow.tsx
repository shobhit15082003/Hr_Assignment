import React, { useCallback } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { SchemaField } from './JsonSchemaBuilder';
import { useState } from 'react';

interface FieldRowProps {
  index: number;
  onRemove: () => void;
  canRemove: boolean;
  level: number;
  parentPath?: string;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const createDefaultField = (): SchemaField => ({
  id: generateId(),
  name: '',
  type: 'String'
});

export const FieldRow: React.FC<FieldRowProps> = ({ 
  index, 
  onRemove, 
  canRemove, 
  level,
  parentPath = 'fields'
}) => {
  const { register, watch, setValue, control } = useFormContext();
  const [isExpanded, setIsExpanded] = useState(true);
  
  const fieldPath = `${parentPath}.${index}`;
  const fieldType = watch(`${fieldPath}.type`);
  const fieldName = watch(`${fieldPath}.name`);
  
  const { fields: nestedFields, append, remove } = useFieldArray({
    control,
    name: `${fieldPath}.nested`
  });

  const handleTypeChange = useCallback((value: string) => {
    setValue(`${fieldPath}.type`, value);
    if (value === 'Nested' && !nestedFields.length) {
      append(createDefaultField());
    } else if (value !== 'Nested') {
      setValue(`${fieldPath}.nested`, []);
    }
  }, [setValue, fieldPath, nestedFields.length, append]);

  const addNestedField = useCallback(() => {
    append(createDefaultField());
  }, [append]);

  const removeNestedField = useCallback((nestedIndex: number) => {
    if (nestedFields.length > 1) {
      remove(nestedIndex);
    }
  }, [remove, nestedFields.length]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const indentationClass = `ml-${level * 4}`;
  const borderColor = level === 0 ? 'border-slate-200' : 'border-slate-300';
  const bgColor = level === 0 ? 'bg-white' : level === 1 ? 'bg-slate-50' : 'bg-slate-100';

  return (
    <div className={`${level > 0 ? indentationClass : ''} space-y-3`}>
      <Card className={`${borderColor} ${bgColor} shadow-sm hover:shadow-md transition-shadow`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Input
                {...register(`${fieldPath}.name`)}
                placeholder="Field name"
                className="bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
            
            <div className="w-32">
              <Select onValueChange={handleTypeChange} defaultValue="String">
                <SelectTrigger className="bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="String">String</SelectItem>
                  <SelectItem value="Number">Number</SelectItem>
                  <SelectItem value="Boolean">Boolean</SelectItem>
                  <SelectItem value="Array">Array</SelectItem>
                  <SelectItem value="Object">Object</SelectItem>
                  <SelectItem value="Nested">Nested</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {fieldType === 'Nested' && nestedFields.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleExpanded}
                className="p-1 h-8 w-8 hover:bg-slate-200"
              >
                {isExpanded ? 
                  <ChevronDown className="w-4 h-4" /> : 
                  <ChevronRight className="w-4 h-4" />
                }
              </Button>
            )}

            {canRemove && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {fieldType === 'Nested' && isExpanded && (
        <div className="space-y-3 border-l-2 border-slate-200 pl-4 ml-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-slate-700">
              Nested Fields {fieldName && `for "${fieldName}"`}
            </h4>
            <Button
              onClick={addNestedField}
              size="sm"
              variant="outline"
              className="text-xs border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Nested
            </Button>
          </div>
          
          {nestedFields.map((nestedField, nestedIndex) => (
            <FieldRow
              key={nestedField.id}
              index={nestedIndex}
              onRemove={() => removeNestedField(nestedIndex)}
              canRemove={nestedFields.length > 1}
              level={level + 1}
              parentPath={`${fieldPath}.nested`}
            />
          ))}
        </div>
      )}
    </div>
  );
};