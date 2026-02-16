import { Plus, Trash2 } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';

const FIELD_CONFIG = {
  age: { label: 'Age', type: 'number' },
  income: { label: 'Annual Income', type: 'number' },
  category: {
    label: 'Category (Caste)',
    type: 'enum',
    options: ['General', 'OBC', 'SC', 'ST', 'EWS']
  },
  education: {
    label: 'Education Level',
    type: 'enum',
    options: ['10th Pass', '12th Pass', 'Graduate', 'Post Graduate', 'PhD']
  },
  state: { label: 'State', type: 'state' }, // Changed type to 'state' to trigger specific rendering
  district: { label: 'District', type: 'district' }, // Changed to 'district' type
  religion: {
    label: 'Religion',
    type: 'enum',
    options: ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Other']
  },
  disability: { label: 'Person with Disability', type: 'boolean' },
  occupation: { label: 'Occupation', type: 'string' },
};

const OPERATORS = {
  number: [
    { value: '==', label: 'Equal to (==)' },
    { value: '!=', label: 'Not equal to (!=)' },
    { value: '<', label: 'Less than (<)' },
    { value: '<=', label: 'Less than or equal (<=)' },
    { value: '>', label: 'Greater than (>)' },
    { value: '>=', label: 'Greater than or equal (>=)' },
  ],
  string: [
    { value: '==', label: 'Equal to (==)' },
    { value: '!=', label: 'Not equal to (!=)' },
    { value: 'in', label: 'In list (in)' },
    { value: 'not in', label: 'Not in list (not in)' },
  ],
  state: [ // Operators for state are same as string/enum
    { value: '==', label: 'Equal to (==)' },
    { value: '!=', label: 'Not equal to (!=)' },
    { value: 'in', label: 'In list (in)' },
    { value: 'not in', label: 'Not in list (not in)' },
  ],
  district: [
    { value: '==', label: 'Equal to (==)' },
    { value: '!=', label: 'Not equal to (!=)' },
    { value: 'in', label: 'In list (in)' },
    { value: 'not in', label: 'Not in list (not in)' },
  ],
  enum: [
    { value: '==', label: 'Equal to (==)' },
    { value: '!=', label: 'Not equal to (!=)' },
    { value: 'in', label: 'In list (in)' },
    { value: 'not in', label: 'Not in list (not in)' },
  ],
  boolean: [
    { value: '==', label: 'Is' },
  ]
};

const RuleBuilder = ({ rules = [], onChange }) => {
  const [items, setItems] = useState([]); // Stores { state, districts[] } objects

  useEffect(() => {
    const fetchStatesAndDistricts = async () => {
      try {
        //For States rules, Fetch states and districts from GitHub
        const response = await fetch('https://raw.githubusercontent.com/sab99r/Indian-States-And-Districts/master/states-and-districts.json');
        if (response.ok) {
          const data = await response.json();
          if (data && data.states) {
            setItems(data.states);
          }
        }
      } catch (error) {
        console.error("Failed to fetch states and districts:", error);
        // Fallback list to ensure State dropdown at least works
        const fallbackStates = [
          "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
          "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
          "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
          "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
          "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands",
          "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi",
          "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
        ];
        setItems(fallbackStates.map(state => ({ state, districts: [] })));
      }
    };
    fetchStatesAndDistricts();
  }, []);

  // Derived state: List of all state names
  const stateOptions = useMemo(() => items.map(i => i.state), [items]);

  // Derived state: Get selected states from rules
  const selectedStateRules = rules.filter(r => r.field === 'state');
  const hasStateRule = selectedStateRules.length > 0;

  // Derived state: Get available districts based on selected states
  const districtOptions = useMemo(() => {
    if (!hasStateRule) return [];

    // Collect all selected state values
    let selectedStates = [];
    selectedStateRules.forEach(rule => {
      if (Array.isArray(rule.value)) {
        selectedStates.push(...rule.value);
      } else if (rule.value) {
        selectedStates.push(rule.value);
      }
    });

    // Filter items to find districts for those states
    const districts = [];
    items.forEach(item => {
      if (selectedStates.includes(item.state)) {
        districts.push(...item.districts);
      }
    });

    // Validate uniqueness and sort
    return [...new Set(districts)].sort();
  }, [items, selectedStateRules, hasStateRule]);

  const addRule = () => {
    onChange([
      ...(rules || []),
      {
        field: 'age',
        operator: '<=',
        value: '',
        weight: 10,
      },
    ]);
  };

  const removeRule = (index) => {
    onChange((rules || []).filter((_, i) => i !== index));
  };

  const updateRule = (index, field, value) => {
    const updatedRules = [...(rules || [])];
    if (updatedRules[index]) {
      // If field changes, reset operator and value based on new type
      if (field === 'field') {
        const newType = FIELD_CONFIG[value]?.type || 'string';
        const newOperators = OPERATORS[newType] || OPERATORS.string;

        updatedRules[index] = {
          ...updatedRules[index],
          field: value,
          operator: newOperators[0]?.value || '==',
          value: '', // Reset value
        };
      } else {
        updatedRules[index] = {
          ...updatedRules[index],
          [field]: value,
        };
      }
      onChange(updatedRules);
    }
  };

  const isArrayOperator = (operator) => {
    return operator === 'in' || operator === 'not in';
  };

  const renderValueInput = (rule, index) => {
    const fieldConfig = FIELD_CONFIG[rule.field];
    const type = fieldConfig?.type || 'string';

    if (type === 'boolean') {
      return (
        <div className="flex items-center space-x-3 h-[42px]">
          <span className={`text-sm ${rule.value === false ? 'font-medium text-slate-700' : 'text-slate-400'}`}>No</span>
          <button
            type="button"
            onClick={() => updateRule(index, 'value', !rule.value)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${rule.value ? 'bg-purple-600' : 'bg-slate-200'
              }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${rule.value ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
          </button>
          <span className={`text-sm ${rule.value === true ? 'font-medium text-slate-700' : 'text-slate-400'}`}>Yes</span>
        </div>
      );
    }

    if (type === 'state') {
      if (isArrayOperator(rule.operator)) {
        return (
          <div className="space-y-2">
            <select
              multiple
              value={Array.isArray(rule.value) ? rule.value : []}
              onChange={(e) => {
                const options = Array.from(e.target.selectedOptions, option => option.value);
                updateRule(index, 'value', options);
              }}
              className="input text-sm min-h-[100px]"
            >
              {stateOptions.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            <p className="text-xs text-slate-500">Hold Ctrl/Cmd to select multiple</p>
          </div>
        );
      }
      return (
        <select
          value={rule.value}
          onChange={(e) => updateRule(index, 'value', e.target.value)}
          className="input text-sm"
        >
          <option value="">Select State</option>
          {stateOptions.map(state => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
      );
    }

    if (type === 'district') {
      if (isArrayOperator(rule.operator)) {
        return (
          <div className="space-y-2">
            <select
              multiple
              value={Array.isArray(rule.value) ? rule.value : []}
              onChange={(e) => {
                const options = Array.from(e.target.selectedOptions, option => option.value);
                updateRule(index, 'value', options);
              }}
              className="input text-sm min-h-[100px]"
              disabled={districtOptions.length === 0}
            >
              {districtOptions.map(dist => (
                <option key={dist} value={dist}>{dist}</option>
              ))}
            </select>
            <p className="text-xs text-slate-500">Hold Ctrl/Cmd to select multiple</p>
          </div>
        );
      }
      return (
        <select
          value={rule.value}
          onChange={(e) => updateRule(index, 'value', e.target.value)}
          className="input text-sm"
          disabled={districtOptions.length === 0}
        >
          <option value="">Select District</option>
          {districtOptions.map(dist => (
            <option key={dist} value={dist}>{dist}</option>
          ))}
        </select>
      );
    }

    if (type === 'enum' && fieldConfig?.options) {
      if (isArrayOperator(rule.operator)) {
        return (
          <div className="space-y-2">
            <select
              multiple
              value={Array.isArray(rule.value) ? rule.value : []}
              onChange={(e) => {
                const options = Array.from(e.target.selectedOptions, option => option.value);
                updateRule(index, 'value', options);
              }}
              className="input text-sm min-h-[100px]"
            >
              {fieldConfig.options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <p className="text-xs text-slate-500">Hold Ctrl/Cmd to select multiple</p>
          </div>
        );
      }
      return (
        <select
          value={rule.value}
          onChange={(e) => updateRule(index, 'value', e.target.value)}
          className="input text-sm"
        >
          <option value="">Select Value</option>
          {fieldConfig.options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    }

    if (isArrayOperator(rule.operator)) {
      return (
        <input
          type="text"
          value={Array.isArray(rule.value) ? rule.value.join(', ') : rule.value}
          onChange={(e) => {
            const values = e.target.value.split(',').map((v) => v.trim());
            updateRule(index, 'value', values);
          }}
          className="input text-sm"
          placeholder="Value1, Value2, Value3"
        />
      );
    }

    return (
      <input
        type={type === 'number' ? 'number' : 'text'}
        value={rule.value}
        onChange={(e) => {
          const val = e.target.value;
          const parsedVal = type === 'number' && val !== '' ? Number(val) : val;
          updateRule(index, 'value', parsedVal);
        }}
        className="input text-sm"
        placeholder={`Enter ${fieldConfig?.label || 'value'}`}
      />
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Eligibility Rules
        </h3>
        <button
          type="button"
          onClick={addRule}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={18} />
          <span>Add Rule</span>
        </button>
      </div>

      {!rules || rules.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
          <p className="text-slate-600 mb-4">No rules added yet</p>
          <button
            type="button"
            onClick={addRule}
            className="btn-outline"
          >
            Add First Rule
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {rules.map((rule, index) => {
            const fieldConfig = FIELD_CONFIG[rule.field];
            const type = fieldConfig?.type || 'string';
            const validOperators = OPERATORS[type] || OPERATORS.string;

            return (
              <div
                key={index}
                className="p-4 border-2 border-purple-200 rounded-lg bg-purple-50/50 hover:border-purple-400 transition-all"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Field */}
                  <div className="md:col-span-3">
                    <label className="label text-xs">Field</label>
                    <select
                      value={rule.field}
                      onChange={(e) => updateRule(index, 'field', e.target.value)}
                      className="input text-sm"
                    >
                      {Object.entries(FIELD_CONFIG).map(([key, config]) => (
                        <option
                          key={key}
                          value={key}
                          disabled={key === 'district' && !hasStateRule}
                        >
                          {config.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Operator */}
                  <div className="md:col-span-3">
                    <label className="label text-xs">Operator</label>
                    <select
                      value={rule.operator}
                      onChange={(e) => updateRule(index, 'operator', e.target.value)}
                      className="input text-sm"
                    >
                      {validOperators.map((op) => (
                        <option key={op.value} value={op.value}>
                          {op.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Value */}
                  <div className="md:col-span-4">
                    <label className="label text-xs">Value</label>
                    {renderValueInput(rule, index)}
                  </div>

                  {/* Weight */}
                  <div className="md:col-span-1">
                    <label className="label text-xs">Weight</label>
                    <input
                      type="number"
                      value={rule.weight}
                      onChange={(e) => updateRule(index, 'weight', parseInt(e.target.value))}
                      className="input text-sm"
                      min="1"
                      max="100"
                    />
                  </div>

                  {/* Delete Button */}
                  <div className="md:col-span-1 flex items-end">
                    <button
                      type="button"
                      onClick={() => removeRule(index)}
                      className="btn-danger w-full md:w-auto p-2"
                      title="Remove rule"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Rule Preview */}
                <div className="mt-3 p-2 bg-white rounded text-sm text-slate-700">
                  <strong>Rule:</strong> {rule.field} {rule.operator}{' '}
                  {Array.isArray(rule.value) ? `[${rule.value.join(', ')}]` : rule.value?.toString()}{' '}
                  <span className="text-purple-600">(Weight: {rule.weight})</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Total Weight */}
      {rules && rules.length > 0 && (
        <div className="p-4 bg-purple-100 rounded-lg border border-purple-300">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-purple-900">Total Weight:</span>
            <span className="text-2xl font-bold text-purple-900">
              {rules.reduce((sum, rule) => sum + (rule?.weight || 0), 0)}
            </span>
          </div>
          <p className="text-xs text-purple-700 mt-2">
            Match percentage is calculated as: (matched weight / total weight) × 100
          </p>
        </div>
      )}
    </div>
  );
};

export default RuleBuilder;
