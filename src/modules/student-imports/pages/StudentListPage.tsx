import React, { useEffect, useState } from 'react';
import { StudentListRecord } from '../types';
import { StudentImportsService } from '../services/StudentImportsService';
import { Search } from 'lucide-react';

export const StudentListPage: React.FC = () => {
  const [students, setStudents] = useState<StudentListRecord[]>([]);
  const [search, setSearch] = useState('');
  const [programmeFilter, setProgrammeFilter] = useState('');

  useEffect(() => {
    StudentImportsService.getStudentList().then(setStudents);
  }, []);

  const filtered = students.filter(s => {
      const matchSearch = s.studentName.toLowerCase().includes(search.toLowerCase()) || s.admissionNumber.toLowerCase().includes(search.toLowerCase());
      const matchProg = programmeFilter === '' || s.programme === programmeFilter;
      return matchSearch && matchProg;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Imported Students List</h1>
          <p className="text-xs text-slate-500 mt-1">
            Verify the student records that have been successfully imported.
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          
        <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search by name or admission number..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
            </div>
            <select 
                value={programmeFilter}
                onChange={(e) => setProgrammeFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
            >
                <option value="">All Programmes</option>
                <option value="MPC + JEE">MPC + JEE</option>
                <option value="BiPC + NEET">BiPC + NEET</option>
                <option value="CEC">CEC</option>
            </select>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                <th className="p-3">Admission No</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Year</th>
                <th className="p-3">Programme</th>
                <th className="p-3">Batch</th>
                <th className="p-3">Section</th>
                <th className="p-3">Guardian Name</th>
                <th className="p-3">Guardian Mobile</th>
                <th className="p-3">Status</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {filtered.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-900">{student.admissionNumber}</td>
                    <td className="p-3 font-semibold text-slate-800">{student.studentName}</td>
                    <td className="p-3 text-slate-600">{student.year}</td>
                    <td className="p-3 text-slate-600">{student.programme}</td>
                    <td className="p-3 text-slate-600">{student.batch}</td>
                    <td className="p-3 text-slate-600">{student.section}</td>
                    <td className="p-3 text-slate-600">{student.guardianName}</td>
                    <td className="p-3 font-mono text-slate-600">{student.guardianMobile}</td>
                    <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {student.status}
                    </span>
                    </td>
                </tr>
                ))}
                {filtered.length === 0 && (
                    <tr>
                        <td colSpan={9} className="p-8 text-center text-slate-500 font-medium">
                            No students found.
                        </td>
                    </tr>
                )}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};
