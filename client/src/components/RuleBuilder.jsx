import { Plus, Trash2 } from 'lucide-react';

const FIELDS = [
  { value: 'age', label: 'Age' },
  { value: 'income', label: 'Annual Income' },
  { value: 'category', label: 'Category (Caste)' },
  { value: 'education', label: 'Education Level' },
  { value: 'gender', label: 'Gender' },
  { value: 'state', label: 'State' },
  { value: 'district', label: 'District' },
  { value: 'maritalStatus', label: 'Marital Status' },
  { value: 'religion', label: 'Religion' },
  { value: 'disability', label: 'Person with Disability' },
  { value: 'occupation', label: 'Occupation' },
];

const OPERATORS = [
  { value: '==', label: 'Equal to (==)' },
  { value: '!=', label: 'Not equal to (!=)' },
  { value: '<', label: 'Less than (<)' },
  { value: '<=', label: 'Less than or equal (<=)' },
  { value: '>', label: 'Greater than (>)' },
  { value: '>=', label: 'Greater than or equal (>=)' },
  { value: 'in', label: 'In array (in)' },
  { value: 'not in', label: 'Not in array (not in)' },
];

const RuleBuilder = ({ rules = [], onChange }) => {
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
      updatedRules[index] = {
        ...updatedRules[index],
        [field]: value,
      };
      onChange(updatedRules);
    }
  };

  const isArrayOperator = (operator) => {
    return operator === 'in' || operator === 'not in';
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
          {rules.map((rule, index) => (
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
                    {FIELDS.map((field) => (
                      <option key={field.value} value={field.value}>
                        {field.label}
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
                    {OPERATORS.map((op) => (
                      <option key={op.value} value={op.value}>
                        {op.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Value */}
                <div className="md:col-span-4">
                  <label className="label text-xs">Value</label>
                  {isArrayOperator(rule.operator) ? (
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
                  ) : (
                    <input
                      type="text"
                      value={rule.value}
                      onChange={(e) => {
                        const val = e.target.value;
                        // Try to parse as number if it looks like a number
                        const parsedVal = !isNaN(val) && val !== '' ? Number(val) : val;
                        updateRule(index, 'value', parsedVal);
                      }}
                      className="input text-sm"
                      placeholder="Enter value"
                    />
                  )}
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
                {Array.isArray(rule.value) ? `[${rule.value.join(', ')}]` : rule.value}{' '}
                <span className="text-purple-600">(Weight: {rule.weight})</span>
              </div>
            </div>
          ))}
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
