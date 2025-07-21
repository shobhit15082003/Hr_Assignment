import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SchemaField } from './JsonSchemaBuilder';

interface JsonPreviewProps {
  fields: SchemaField[];
}

export const JsonPreview: React.FC<JsonPreviewProps> = ({ fields }) => {
  const { toast } = useToast();

  const jsonSchema = useMemo(() => {
    const buildSchema = (fields: SchemaField[]): Record<string, any> => {
      const schema: Record<string, any> = {};
      
      fields.forEach(field => {
        if (field.name.trim()) {
          if (field.type === 'String') {
            schema[field.name] = "string_value";
          } else if (field.type === 'Number') {
            schema[field.name] = 0;
          } else if (field.type === 'Boolean') {
            schema[field.name] = true;
          } else if (field.type === 'Array') {
            schema[field.name] = ["array_item_1", "array_item_2"];
          } else if (field.type === 'Object') {
            schema[field.name] = {
              "property1": "value1",
              "property2": "value2"
            };
          } else if (field.type === 'Nested' && field.nested) {
            schema[field.name] = buildSchema(field.nested);
          }
        }
      });
      
      return schema;
    };

    return buildSchema(fields);
  }, [fields]);

  const formattedJson = JSON.stringify(jsonSchema, null, 4);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(formattedJson);
      toast({
        title: "Copied!",
        description: "JSON schema copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const downloadJson = () => {
    const blob = new Blob([formattedJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schema.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: "JSON schema downloaded successfully",
    });
  };

  return (
    <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-slate-900 flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            Real-time JSON Preview
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="text-xs"
            >
              <Copy className="w-3 h-3 mr-1" />
              Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadJson}
              className="text-xs"
            >
              <Download className="w-3 h-3 mr-1" />
              Download
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <pre className="bg-slate-900 text-green-400 p-6 rounded-lg overflow-auto max-h-[500px] text-sm font-mono border leading-relaxed">
            <code>{formattedJson}</code>
          </pre>
          {Object.keys(jsonSchema).length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 text-slate-400 rounded-lg">
              <p className="text-center">
                No valid fields to preview<br />
                <span className="text-sm opacity-75">Add some fields with names to see the JSON output</span>
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};