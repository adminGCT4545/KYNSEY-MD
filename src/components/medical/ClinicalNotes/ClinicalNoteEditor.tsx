import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Button, Input, Alert, Spinner } from '../../ui/';

interface ClinicalNote {
  note_id?: number;
  chart_id: number;
  provider_id: number;
  note_type: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  signature?: string;
  signed_at?: string;
}

interface ClinicalNoteEditorProps {
  chartId: number;
  providerId: number;
  existingNote?: ClinicalNote;
  onSave: (note: ClinicalNote) => void;
  onCancel: () => void;
}

const ClinicalNoteEditor: React.FC<ClinicalNoteEditorProps> = ({
  chartId,
  providerId,
  existingNote,
  onSave,
  onCancel
}) => {
  const [note, setNote] = useState<ClinicalNote>({
    chart_id: chartId,
    provider_id: providerId,
    note_type: 'SOAP',
    subjective: '',
    objective: '',
    assessment: '',
    plan: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  // Load existing note data if provided
  useEffect(() => {
    if (existingNote) {
      setNote(existingNote);
    }
    
    // Load templates
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/medical/clinical-notes/templates/SOAP`);
        setTemplates(response.data);
      } catch (err) {
        console.error('Error loading templates:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTemplates();
  }, [existingNote]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNote(prev => ({ ...prev, [name]: value }));
  };

  const handleTemplateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value;
    setSelectedTemplate(templateId);
    
    if (!templateId) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`/api/medical/clinical-notes/templates/${templateId}`);
      const template = response.data;
      
      setNote(prev => ({
        ...prev,
        subjective: template.subjective_template || prev.subjective,
        objective: template.objective_template || prev.objective,
        assessment: template.assessment_template || prev.assessment,
        plan: template.plan_template || prev.plan
      }));
    } catch (err) {
      console.error('Error loading template:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      
      let savedNote;
      if (existingNote?.note_id) {
        // Update existing note
        const response = await axios.put(`/api/medical/clinical-notes/${existingNote.note_id}`, note);
        savedNote = response.data;
      } else {
        // Create new note
        const response = await axios.post('/api/medical/clinical-notes', note);
        savedNote = response.data;
      }
      
      onSave(savedNote);
    } catch (err) {
      console.error('Error saving clinical note:', err);
      setError('Failed to save clinical note. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const isExistingNoteSigned = existingNote?.signed_at;

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-6">
        {existingNote ? 'Edit Clinical Note' : 'New Clinical Note'}
      </h2>
      
      {isExistingNoteSigned && (
        <Alert variant="warning" className="mb-4">
          This note has been signed and cannot be edited. You can create an amendment instead.
        </Alert>
      )}
      
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}
      
      <form onSubmit={handleSave}>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="w-1/3 pr-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Note Type
              </label>
              <select
                name="note_type"
                value={note.note_type}
                onChange={(e) => setNote({ ...note, note_type: e.target.value })}
                disabled={isExistingNoteSigned}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="SOAP">SOAP Note</option>
                <option value="Progress">Progress Note</option>
                <option value="Consultation">Consultation</option>
                <option value="Procedure">Procedure Note</option>
                <option value="Discharge">Discharge Summary</option>
              </select>
            </div>
            
            {!existingNote && (
              <div className="w-2/3 pl-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Templates
                </label>
                <select
                  value={selectedTemplate}
                  onChange={handleTemplateChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select a template</option>
                  {templates.map(template => (
                    <option key={template.template_id} value={template.template_id}>
                      {template.template_name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subjective
          </label>
          <textarea
            name="subjective"
            value={note.subjective}
            onChange={handleInputChange}
            disabled={isExistingNoteSigned}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={5}
            placeholder="Chief complaint, history of present illness, review of systems, etc."
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Objective
          </label>
          <textarea
            name="objective"
            value={note.objective}
            onChange={handleInputChange}
            disabled={isExistingNoteSigned}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={5}
            placeholder="Vital signs, physical examination findings, test results, etc."
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assessment
          </label>
          <textarea
            name="assessment"
            value={note.assessment}
            onChange={handleInputChange}
            disabled={isExistingNoteSigned}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={3}
            placeholder="Diagnoses, differential diagnoses, clinical impression, etc."
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Plan
          </label>
          <textarea
            name="plan"
            value={note.plan}
            onChange={handleInputChange}
            disabled={isExistingNoteSigned}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={5}
            placeholder="Treatment plans, medications, follow-up recommendations, etc."
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outlined"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={saving || isExistingNoteSigned}
          >
            {saving ? 'Saving...' : 'Save Note'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ClinicalNoteEditor;