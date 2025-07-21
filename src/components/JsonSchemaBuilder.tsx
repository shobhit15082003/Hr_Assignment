import React, { useState, useCallback } from 'react';
import { useFieldArray, useForm, FormProvider } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { FieldRow } from './FieldRow';
import { JsonPreview } from './JsonPreview';

export interface SchemaField {
  id: string;
  name: string;
  type: 'String' | 'Number' | 'Boolean' | 'Array' | 'Object' | 'Nested';
  nested?: SchemaField[];
}

interface FormData {
  fields: SchemaField[];
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const createDefaultField = (): SchemaField => ({
  id: generateId(),
  name: '',
  type: 'String'
});

export const JsonSchemaBuilder: React.FC = () => {
  const methods = useForm<FormData>({
    defaultValues: {
      fields: [createDefaultField()]
    },
    mode: 'onChange'
  });

  const { control, watch } = methods;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'fields'
  });

  const watchedFields = watch('fields');

  const addField = useCallback(() => {
    append(createDefaultField());
  }, [append]);

  const removeField = useCallback((index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  }, [remove, fields.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">JSON Schema Builder</h1>
          <p className="text-slate-600">Create dynamic JSON schemas with nested fields and real-time preview</p>
        </div>

        <FormProvider {...methods}>
          <Tabs defaultValue="builder" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="builder" className="text-sm font-medium">
                Schema Builder
              </TabsTrigger>
              <TabsTrigger value="preview" className="text-sm font-medium">
                JSON Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="builder" className="space-y-6">
              <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center justify-between text-slate-900">
                    Schema Fields
                    <Button 
                      onClick={addField}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Field
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fields.map((field, index) => (
                    <FieldRow
                      key={field.id}
                      index={index}
                      onRemove={() => removeField(index)}
                      canRemove={fields.length > 1}
                      level={0}
                    />
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview">
              <JsonPreview fields={watchedFields} />
            </TabsContent>
          </Tabs>
        </FormProvider>
      </div>
    </div>
  );
};