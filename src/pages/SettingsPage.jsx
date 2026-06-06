import { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useTheme }    from '../context/ThemeContext';
import {
  Settings, Utensils, Wallet, Bell, Palette,
  Save, Plus, Trash2, RotateCcw, Moon, Sun, Check
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const { dark, toggle } = useTheme();
  const [form, setForm]   = useState(settings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  useEffect(() => { setForm(settings); }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    const ok = await updateSettings(form);
    setSaving(false);
    if (ok) {
      setSaved(true);
      toast.success('Settings সেভ হয়েছে! ✅');
      setTimeout(() => setSaved(false), 2000);
    } else {
      toast.error('Error হয়েছে');
    }
  };

  const handleReset = () => {
    setForm(settings);
    toast.success('Reset হয়েছে');
  };

  const addCategory = (type) => {
    const key = type === 'mess' ? 'messCategories' : 'personalCategories';
    const newCat = prompt('নতুন category এর নাম:');
    if (newCat?.trim()) {
      setForm(prev => ({ ...prev, [key]: [...prev[key], newCat.trim()] }));
    }
  };

  const removeCategory = (type, index) => {
    const key = type === 'mess' ? 'messCategories' : 'personalCategories';
    setForm(prev => ({ ...prev, [key]: prev[key].filter((_, i) => i !== index) }));
  };

  const sections = [
    { id: 'general',      label: 'General',          icon: Settings },
    { id: 'meal',         label: 'Meal Settings',     icon: Utensils },
    { id: 'categories',   label: 'Categories',        icon: Wallet },
    { id: 'notification', label: 'Notification',      icon: Bell },
    { id: 'appearance',   label: 'Appearance',        icon: Palette },
  ];

  const [activeSection, setActiveSection] = useState('general');

  return (
    <div>
      {/* Header */}
      <div className="page-header flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Settings size={24} className="text-indigo-600 dark:text-indigo-400" />
            Settings
          </h1>
          <p className="page-sub">App এর সব settings এখানে customize করুন</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleReset} className="btn-outline">
            <RotateCcw size={15} /> Reset
          </button>
          <button onClick={handleSave} disabled={saving}
            className={`btn ${saved ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'btn-primary'}`}>
            {saved ? <Check size={15} /> : <Save size={15} />}
            {saving ? 'সেভ হচ্ছে...' : saved ? 'Saved!' : 'Save করুন'}
          </button>
        </div>
      </div>

      <div className="flex gap-5 flex-col md:flex-row">
        {/* Sidebar Navigation */}
        <div className="md:w-48 flex-shrink-0">
          <div className="card p-2 sticky top-24">
            {sections.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-0.5 ${
                  activeSection === s.id
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}>
                <s.icon size={16} />
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">

          {/* General */}
          {activeSection === 'general' && (
            <div className="card">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                <Settings size={17} className="text-indigo-500" /> General Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="label">Mess / App এর নাম</label>
                  <input className="input" value={form.messName || ''}
                    onChange={e => setForm({ ...form, messName: e.target.value })}
                    placeholder="Bachelor's Wallet" />
                </div>
                <div>
                  <label className="label">Currency Symbol</label>
                  <div className="flex gap-2 flex-wrap">
                    {['৳', '৲', 'BDT', '₹', '$', '€'].map(sym => (
                      <button key={sym} type="button"
                        onClick={() => setForm({ ...form, currencySymbol: sym })}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                          form.currencySymbol === sym
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-300'
                        }`}>
                        {sym}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">Bill Calculation Method</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                    {[
                      { value: 'meal_based',   title: 'Meal Based',   desc: 'মিল হিসেবে বিল ভাগ হবে (recommended)' },
                      { value: 'equal_split',  title: 'Equal Split',  desc: 'সবাই সমান বিল দেবে' },
                    ].map(m => (
                      <button key={m.value} type="button"
                        onClick={() => setForm({ ...form, billMethod: m.value })}
                        className={`p-4 rounded-2xl border-2 text-left transition-all ${
                          form.billMethod === m.value
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                        }`}>
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">{m.title}</p>
                          {form.billMethod === m.value && (
                            <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                              <Check size={12} className="text-white" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{m.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Meal Settings */}
          {activeSection === 'meal' && (
            <div className="card">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1 flex items-center gap-2">
                <Utensils size={17} className="text-amber-500" /> Meal Weight Settings
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                প্রতিটি meal এর weight ঠিক করুন। বিল calculate করার সময় এই weight ব্যবহার হবে।
              </p>

              <div className="space-y-5">
                {[
                  { key: 'breakfast', label: 'সকালের নাস্তা',  icon: '☀️', desc: 'সাধারণত ০.৫ রাখা হয়' },
                  { key: 'lunch',     label: 'দুপুরের খাবার', icon: '🌤️', desc: 'সাধারণত ১.০ রাখা হয়' },
                  { key: 'dinner',    label: 'রাতের খাবার',   icon: '🌙', desc: 'সাধারণত ১.০ রাখা হয়' },
                ].map(meal => (
                  <div key={meal.key}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {meal.icon} {meal.label}
                        </p>
                        <p className="text-xs text-gray-400">{meal.desc}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setForm(prev => ({
                            ...prev,
                            mealWeights: {
                              ...prev.mealWeights,
                              [meal.key]: Math.max(0.25, +(prev.mealWeights[meal.key] - 0.25).toFixed(2))
                            }
                          }))}
                          className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600 transition-all font-bold text-lg">
                          −
                        </button>
                        <div className="w-16 text-center">
                          <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                            {form.mealWeights?.[meal.key] || 1}
                          </span>
                          <p className="text-xs text-gray-400">মিল</p>
                        </div>
                        <button
                          onClick={() => setForm(prev => ({
                            ...prev,
                            mealWeights: {
                              ...prev.mealWeights,
                              [meal.key]: Math.min(2, +(prev.mealWeights[meal.key] + 0.25).toFixed(2))
                            }
                          }))}
                          className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600 transition-all font-bold text-lg">
                          +
                        </button>
                      </div>
                    </div>
                    {/* Visual bar */}
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                      <div className="h-2 rounded-full bg-indigo-500 transition-all duration-300"
                        style={{ width: `${(form.mealWeights?.[meal.key] || 1) * 50}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Preview */}
              <div className="mt-5 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2">Preview — যদি ১০০০ টাকা খরচ হয়:</p>
                <div className="space-y-1">
                  {[
                    { key: 'breakfast', label: 'সকাল' },
                    { key: 'lunch',     label: 'দুপুর' },
                    { key: 'dinner',    label: 'রাত' },
                  ].map(m => {
                    const total = (form.mealWeights?.breakfast || 0.5) + (form.mealWeights?.lunch || 1) + (form.mealWeights?.dinner || 1);
                    const cost  = ((form.mealWeights?.[m.key] || 1) / total * 1000).toFixed(0);
                    return (
                      <div key={m.key} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">{m.label} ({form.mealWeights?.[m.key] || 1} মিল)</span>
                        <span className="font-semibold text-indigo-700 dark:text-indigo-300">{form.currencySymbol || '৳'}{cost}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Categories */}
          {activeSection === 'categories' && (
            <div className="space-y-4">
              {/* Mess Categories */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <Wallet size={17} className="text-emerald-500" /> Mess খরচের Category
                  </h3>
                  <button onClick={() => addCategory('mess')} className="btn-outline text-xs py-1.5">
                    <Plus size={13} /> যোগ করুন
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.messCategories?.map((cat, i) => (
                    <div key={i}
                      className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-800/50 text-sm font-medium">
                      {cat}
                      <button onClick={() => removeCategory('mess', i)}
                        className="w-4 h-4 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-800 flex items-center justify-center transition-all">
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Personal Categories */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <Wallet size={17} className="text-indigo-500" /> Personal খরচের Category
                  </h3>
                  <button onClick={() => addCategory('personal')} className="btn-outline text-xs py-1.5">
                    <Plus size={13} /> যোগ করুন
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.personalCategories?.map((cat, i) => (
                    <div key={i}
                      className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-xl border border-indigo-100 dark:border-indigo-800/50 text-sm font-medium">
                      {cat}
                      <button onClick={() => removeCategory('personal', i)}
                        className="w-4 h-4 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800 flex items-center justify-center transition-all">
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Notification */}
          {activeSection === 'notification' && (
            <div className="card">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                <Bell size={17} className="text-violet-500" /> Notification Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">Daily Meal Reminder</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">প্রতিদিন meal entry এর reminder</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer"
                      checked={form.reminderEnabled || false}
                      onChange={e => setForm({ ...form, reminderEnabled: e.target.checked })} />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
                  </label>
                </div>

                {form.reminderEnabled && (
                  <div>
                    <label className="label">Reminder Time</label>
                    <input type="time" className="input w-auto"
                      value={form.mealReminderTime || '21:00'}
                      onChange={e => setForm({ ...form, mealReminderTime: e.target.value })} />
                    <p className="text-xs text-gray-400 mt-1">
                      প্রতিদিন এই সময়ে notification আসবে
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Appearance */}
          {activeSection === 'appearance' && (
            <div className="card">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                <Palette size={17} className="text-pink-500" /> Appearance
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="label">Theme</label>
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    <button onClick={() => !dark && toggle()}
                      className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                        !dark ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                      }`}>
                      <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                        <Sun size={18} className="text-amber-500" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">Light Mode</p>
                        <p className="text-xs text-gray-500">উজ্জ্বল theme</p>
                      </div>
                      {!dark && <Check size={16} className="ml-auto text-indigo-500" />}
                    </button>

                    <button onClick={() => dark || toggle()}
                      className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                        dark ? 'border-indigo-500 bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                      }`}>
                      <div className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-700 flex items-center justify-center shadow-sm">
                        <Moon size={18} className="text-indigo-400" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">Dark Mode</p>
                        <p className="text-xs text-gray-500">চোখের জন্য আরামদায়ক</p>
                      </div>
                      {dark && <Check size={16} className="ml-auto text-indigo-500" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button (bottom) */}
          <div className="flex justify-end gap-2 pb-4">
            <button onClick={handleReset} className="btn-outline">
              <RotateCcw size={15} /> Reset
            </button>
            <button onClick={handleSave} disabled={saving}
              className={`btn ${saved ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'btn-primary'}`}>
              {saved ? <Check size={15} /> : <Save size={15} />}
              {saving ? 'সেভ হচ্ছে...' : saved ? 'Saved!' : 'Save করুন'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}