'use client';

import { useState, useEffect } from 'react';
import { University } from '@/lib/university-api';

interface UniversitySearchProps {
  onSelectUniversity: (university: University) => void;
  selectedUniversities: University[];
}

export default function UniversitySearch({ onSelectUniversity, selectedUniversities }: UniversitySearchProps) {
  const [universities, setUniversities] = useState<University[]>([]);
  const [filteredUniversities, setFilteredUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrefecture, setSelectedPrefecture] = useState('');
  const [selectedType, setSelectedType] = useState('');

  useEffect(() => {
    fetchUniversities();
  }, []);

  useEffect(() => {
    filterUniversities();
  }, [universities, searchTerm, selectedPrefecture, selectedType]);

  const fetchUniversities = async () => {
    try {
      const response = await fetch('/api/universities');
      const data = await response.json();
      
      if (data.success) {
        setUniversities(data.universities);
      }
    } catch (error) {
      console.error('Error fetching universities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUniversities = () => {
    let filtered = [...universities];

    // 名前で検索
    if (searchTerm) {
      filtered = filtered.filter(uni => 
        uni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        uni.departments.some(dept => 
          dept.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // 都道府県でフィルタリング
    if (selectedPrefecture) {
      filtered = filtered.filter(uni => 
        uni.prefecture.includes(selectedPrefecture)
      );
    }

    // タイプでフィルタリング
    if (selectedType) {
      filtered = filtered.filter(uni => 
        uni.type.includes(selectedType)
      );
    }

    setFilteredUniversities(filtered);
  };

  const prefectures = [...new Set(universities.map(uni => uni.prefecture))];
  const types = [...new Set(universities.map(uni => uni.type))];

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">大学データを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">大学検索</h2>
      
      {/* 検索フィルター */}
      <div className="space-y-4 mb-6">
        {/* 検索ボックス */}
        <div>
          <input
            type="text"
            placeholder="大学名や学部名で検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* フィルター */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              都道府県
            </label>
            <select
              value={selectedPrefecture}
              onChange={(e) => setSelectedPrefecture(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">すべて</option>
              {prefectures.map(pref => (
                <option key={pref} value={pref}>{pref}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              大学タイプ
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">すべて</option>
              {types.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 大学リスト */}
      <div className="max-h-96 overflow-y-auto">
        <div className="space-y-3">
          {filteredUniversities.map((university) => {
            const isSelected = selectedUniversities.some(selected => selected.id === university.id);
            
            return (
              <div
                key={university.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  isSelected 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onSelectUniversity(university)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{university.name}</h3>
                    <p className="text-sm text-gray-600">{university.type}</p>
                    <p className="text-sm text-gray-500">{university.prefecture} {university.city}</p>
                    
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">主要学部:</p>
                      <div className="flex flex-wrap gap-1">
                        {university.departments.slice(0, 3).map((dept, index) => (
                          <span
                            key={index}
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                          >
                            {dept}
                          </span>
                        ))}
                        {university.departments.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{university.departments.length - 3}他
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    {isSelected ? (
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {filteredUniversities.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">検索条件に一致する大学が見つかりませんでした。</p>
          </div>
        )}
      </div>

      {/* 選択された大学の表示 */}
      {selectedUniversities.length > 0 && (
        <div className="mt-6 pt-6 border-t">
          <h3 className="font-semibold text-gray-800 mb-3">
            選択された大学 ({selectedUniversities.length}件)
          </h3>
          <div className="space-y-2">
            {selectedUniversities.map((university) => (
              <div key={university.id} className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-800">{university.name}</span>
                  <span className="text-sm text-gray-600 ml-2">({university.type})</span>
                </div>
                <button
                  onClick={() => onSelectUniversity(university)}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
