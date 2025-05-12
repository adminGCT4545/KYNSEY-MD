import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DailyScheduleView from '../components/medical/DailyScheduleView';

/**
 * Medical Module component
 * Main entry point for the medical scheduling system
 */
const MedicalModule: React.FC = () => {
  return (
    <div className="medical-module p-4">
      <DndProvider backend={HTML5Backend}>
        <DailyScheduleView />
      </DndProvider>
    </div>
  );
};

export default MedicalModule;