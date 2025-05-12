import React, { useState } from 'react';
import { Tabs, Tab, Button } from '../../ui/';
import LabResultsList from './LabResultsList';
import LabResultsDetail from './LabResultsDetail';
import LabResultsTrends from './LabResultsTrends';

interface LabResult {
  lab_id: number;
  chart_id: number;
  test_name: string;
  test_date: string;
  result: string;
  reference_range: string;
  units: string;
  abnormal: boolean;
  notes: string;
}

interface LabResultsModuleProps {
  patientId: number;
  chartId?: number;
}

const LabResultsModule: React.FC<LabResultsModuleProps> = ({ patientId, chartId }) => {
  const [activeTab, setActiveTab] = useState<'list' | 'trends'>('list');
  const [selectedResult, setSelectedResult] = useState<LabResult | null>(null);
  const [selectedTrendTest, setSelectedTrendTest] = useState<string | null>(null);

  const handleSelectResult = (result: LabResult) => {
    setSelectedResult(result);
  };

  const handleCloseDetail = () => {
    setSelectedResult(null);
  };

  const handleShowTrends = (result: LabResult) => {
    setSelectedTrendTest(result.test_name);
    setActiveTab('trends');
  };

  const handlePrintResult = () => {
    // Implementation for printing functionality
    window.print();
  };

  return (
    <div className="bg-white rounded-md shadow-sm">
      <Tabs value={activeTab} onChange={(value) => setActiveTab(value as 'list' | 'trends')}>
        <Tab value="list" label="Lab Results" />
        <Tab value="trends" label="Trends Analysis" disabled={!selectedTrendTest} />
      </Tabs>

      <div className="p-4">
        {activeTab === 'list' && (
          <>
            {selectedResult ? (
              <div>
                <LabResultsDetail 
                  result={selectedResult} 
                  onClose={handleCloseDetail} 
                  onPrint={handlePrintResult} 
                />
                <div className="mt-4 flex justify-center">
                  <Button 
                    variant="secondary"
                    onClick={() => handleShowTrends(selectedResult)}
                  >
                    View Trends for {selectedResult.test_name}
                  </Button>
                </div>
              </div>
            ) : (
              <LabResultsList 
                patientId={patientId} 
                chartId={chartId} 
                onSelectResult={handleSelectResult} 
              />
            )}
          </>
        )}

        {activeTab === 'trends' && selectedTrendTest && (
          <LabResultsTrends 
            patientId={patientId} 
            testName={selectedTrendTest} 
          />
        )}
      </div>
    </div>
  );
};

export default LabResultsModule;