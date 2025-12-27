import React, { useEffect, useState } from 'react';
import { supabase } from '../src/lib/supabase';
import { useModuleAccess } from '../src/hooks/useModuleAccess';

interface Course {
    id: string;
    name: string;
    description: string;
    duration_hours: number;
    price: number;
    max_students: number;
    instructor: string;
    status: string;
    created_at: string;
}

interface Enrollment {
    id: string;
    student_name: string;
    student_email: string;
    student_phone: string;
    enrolled_at: string;
    status: string;
    course_id: string;
}

export const Courses: React.FC = () => {
    const { hasModule, loading: moduleLoading } = useModuleAccess();
    const [courses, setCourses] = useState<Course[]>([]);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [courseForm, setCourseForm] = useState({
        name: '',
        description: '',
        duration_hours: 8,
        price: 0,
        max_students: 20,
        instructor: '',
        status: 'ACTIVE'
    });
    const [enrollmentForm, setEnrollmentForm] = useState({
        student_name: '',
        student_email: '',
        student_phone: '',
        course_id: ''
    });

    useEffect(() => {
        if (!moduleLoading) {
            fetchCourses();
        }
    }, [moduleLoading]);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCourses(data || []);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEnrollments = async (courseId: string) => {
        try {
            const { data, error } = await supabase
                .from('course_enrollments')
                .select('*')
                .eq('course_id', courseId)
                .order('enrolled_at', { ascending: false });

            if (error) throw error;
            setEnrollments(data || []);
        } catch (error) {
            console.error('Error fetching enrollments:', error);
        }
    };

    const handleCreateCourse = async () => {
        try {
            if (!courseForm.name || !courseForm.instructor) {
                alert('Por favor, preencha o nome do curso e o instrutor.');
                return;
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('tenant_id')
                .eq('id', (await supabase.auth.getUser()).data.user?.id)
                .single();

            if (!profile?.tenant_id) {
                alert('Erro ao identificar o salão.');
                return;
            }

            const { error } = await supabase
                .from('courses')
                .insert({
                    ...courseForm,
                    tenant_id: profile.tenant_id
                });

            if (error) throw error;

            alert('Curso criado com sucesso!');
            setShowCourseModal(false);
            resetCourseForm();
            fetchCourses();
        } catch (error) {
            console.error('Error creating course:', error);
            alert('Erro ao criar curso');
        }
    };

    const handleUpdateCourse = async () => {
        if (!selectedCourse) return;

        try {
            const { error } = await supabase
                .from('courses')
                .update(courseForm)
                .eq('id', selectedCourse.id);

            if (error) throw error;

            alert('Curso atualizado com sucesso!');
            setShowCourseModal(false);
            setSelectedCourse(null);
            resetCourseForm();
            fetchCourses();
        } catch (error) {
            console.error('Error updating course:', error);
            alert('Erro ao atualizar curso');
        }
    };

    const handleDeleteCourse = async (courseId: string) => {
        if (!confirm('Tem certeza que deseja excluir este curso?')) return;

        try {
            const { error } = await supabase
                .from('courses')
                .delete()
                .eq('id', courseId);

            if (error) throw error;

            alert('Curso excluído com sucesso!');
            fetchCourses();
        } catch (error) {
            console.error('Error deleting course:', error);
            alert('Erro ao excluir curso');
        }
    };

    const handleEnrollStudent = async () => {
        try {
            if (!enrollmentForm.student_name || !enrollmentForm.student_email || !enrollmentForm.course_id) {
                alert('Por favor, preencha todos os campos obrigatórios.');
                return;
            }

            const { error } = await supabase
                .from('course_enrollments')
                .insert({
                    ...enrollmentForm,
                    status: 'ENROLLED'
                });

            if (error) throw error;

            alert('Aluno inscrito com sucesso!');
            setShowEnrollmentModal(false);
            resetEnrollmentForm();
            if (selectedCourse) {
                fetchEnrollments(selectedCourse.id);
            }
        } catch (error) {
            console.error('Error enrolling student:', error);
            alert('Erro ao inscrever aluno');
        }
    };

    const openCourseModal = (course?: Course) => {
        if (course) {
            setSelectedCourse(course);
            setCourseForm({
                name: course.name,
                description: course.description || '',
                duration_hours: course.duration_hours,
                price: course.price,
                max_students: course.max_students,
                instructor: course.instructor || '',
                status: course.status
            });
        } else {
            setSelectedCourse(null);
            resetCourseForm();
        }
        setShowCourseModal(true);
    };

    const openEnrollmentModal = (course: Course) => {
        setSelectedCourse(course);
        setEnrollmentForm({
            ...enrollmentForm,
            course_id: course.id
        });
        fetchEnrollments(course.id);
        setShowEnrollmentModal(true);
    };

    const resetCourseForm = () => {
        setCourseForm({
            name: '',
            description: '',
            duration_hours: 8,
            price: 0,
            max_students: 20,
            instructor: '',
            status: 'ACTIVE'
        });
    };

    const resetEnrollmentForm = () => {
        setEnrollmentForm({
            student_name: '',
            student_email: '',
            student_phone: '',
            course_id: ''
        });
    };

    // Module access check
    if (moduleLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <i className="fas fa-circle-notch animate-spin text-4xl text-indigo-500"></i>
            </div>
        );
    }

    if (!hasModule('courses')) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-center px-4">
                <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6 text-amber-600">
                    <i className="fas fa-lock text-3xl"></i>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">Módulo de Cursos Bloqueado</h3>
                <p className="text-slate-500 mb-6 max-w-md">
                    Este recurso está disponível apenas para clientes do plano <span className="font-bold text-indigo-600">ENTERPRISE</span>.
                </p>
                <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg">
                    <i className="fas fa-arrow-up mr-2"></i> Fazer Upgrade
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 mb-2">Cursos Presenciais</h1>
                    <p className="text-slate-500">Gerencie cursos e inscrições de alunos</p>
                </div>
                <button
                    onClick={() => openCourseModal()}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg flex items-center gap-2"
                >
                    <i className="fas fa-plus"></i> Novo Curso
                </button>
            </div>

            {/* Courses Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <i className="fas fa-circle-notch animate-spin text-4xl text-indigo-500"></i>
                </div>
            ) : courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <div key={course.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                    <i className="fas fa-graduation-cap text-xl"></i>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${course.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                                    {course.status}
                                </span>
                            </div>

                            <h3 className="text-lg font-black text-slate-900 mb-2 line-clamp-2">{course.name}</h3>
                            <p className="text-sm text-slate-500 mb-4 line-clamp-2">{course.description}</p>

                            <div className="space-y-2 mb-6">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <i className="fas fa-clock text-indigo-500 w-4"></i>
                                    <span>{course.duration_hours}h de duração</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <i className="fas fa-euro-sign text-emerald-500 w-4"></i>
                                    <span className="font-bold">€{course.price.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <i className="fas fa-users text-purple-500 w-4"></i>
                                    <span>Máx. {course.max_students} alunos</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <i className="fas fa-chalkboard-teacher text-amber-500 w-4"></i>
                                    <span>{course.instructor}</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => openEnrollmentModal(course)}
                                    className="flex-1 py-2 px-3 bg-indigo-50 text-indigo-600 font-bold rounded-lg text-sm hover:bg-indigo-100 transition-all"
                                >
                                    <i className="fas fa-user-plus mr-1"></i> Inscrições
                                </button>
                                <button
                                    onClick={() => openCourseModal(course)}
                                    className="py-2 px-3 bg-slate-50 text-slate-600 font-bold rounded-lg text-sm hover:bg-slate-100 transition-all"
                                >
                                    <i className="fas fa-edit"></i>
                                </button>
                                <button
                                    onClick={() => handleDeleteCourse(course.id)}
                                    className="py-2 px-3 bg-rose-50 text-rose-600 font-bold rounded-lg text-sm hover:bg-rose-100 transition-all"
                                >
                                    <i className="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
                        <i className="fas fa-graduation-cap text-3xl"></i>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">Nenhum Curso Cadastrado</h3>
                    <p className="text-slate-500 mb-6">Comece criando seu primeiro curso presencial.</p>
                    <button
                        onClick={() => openCourseModal()}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg"
                    >
                        <i className="fas fa-plus mr-2"></i> Criar Primeiro Curso
                    </button>
                </div>
            )}

            {/* Course Modal */}
            {showCourseModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h3 className="text-xl font-black text-slate-800">
                                {selectedCourse ? 'Editar Curso' : 'Novo Curso'}
                            </h3>
                            <button
                                onClick={() => setShowCourseModal(false)}
                                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nome do Curso</label>
                                <input
                                    type="text"
                                    value={courseForm.name}
                                    onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                                    placeholder="Ex: Técnicas Avançadas de Coloração"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Descrição</label>
                                <textarea
                                    value={courseForm.description}
                                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                                    placeholder="Descreva o conteúdo do curso..."
                                    rows={3}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none"
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Duração (horas)</label>
                                    <input
                                        type="number"
                                        value={courseForm.duration_hours}
                                        onChange={(e) => setCourseForm({ ...courseForm, duration_hours: parseInt(e.target.value) })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Preço (€)</label>
                                    <input
                                        type="number"
                                        value={courseForm.price}
                                        onChange={(e) => setCourseForm({ ...courseForm, price: parseFloat(e.target.value) })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Máx. Alunos</label>
                                    <input
                                        type="number"
                                        value={courseForm.max_students}
                                        onChange={(e) => setCourseForm({ ...courseForm, max_students: parseInt(e.target.value) })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                                    <select
                                        value={courseForm.status}
                                        onChange={(e) => setCourseForm({ ...courseForm, status: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                    >
                                        <option value="ACTIVE">ATIVO</option>
                                        <option value="INACTIVE">INATIVO</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Instrutor</label>
                                <input
                                    type="text"
                                    value={courseForm.instructor}
                                    onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })}
                                    placeholder="Nome do instrutor"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                            <button
                                onClick={() => setShowCourseModal(false)}
                                className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={selectedCourse ? handleUpdateCourse : handleCreateCourse}
                                className="px-6 py-3 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/20 transition-all"
                            >
                                {selectedCourse ? 'Salvar Alterações' : 'Criar Curso'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Enrollment Modal */}
            {showEnrollmentModal && selectedCourse && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <div>
                                <h3 className="text-xl font-black text-slate-800">Inscrições</h3>
                                <p className="text-sm text-slate-500 mt-1">{selectedCourse.name}</p>
                            </div>
                            <button
                                onClick={() => setShowEnrollmentModal(false)}
                                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Enrollment Form */}
                            <div className="bg-indigo-50 rounded-xl p-4 mb-6 border border-indigo-100">
                                <h4 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-4">Nova Inscrição</h4>
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={enrollmentForm.student_name}
                                        onChange={(e) => setEnrollmentForm({ ...enrollmentForm, student_name: e.target.value })}
                                        placeholder="Nome do Aluno"
                                        className="w-full bg-white border border-indigo-200 rounded-lg px-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            type="email"
                                            value={enrollmentForm.student_email}
                                            onChange={(e) => setEnrollmentForm({ ...enrollmentForm, student_email: e.target.value })}
                                            placeholder="Email"
                                            className="w-full bg-white border border-indigo-200 rounded-lg px-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                        />
                                        <input
                                            type="tel"
                                            value={enrollmentForm.student_phone}
                                            onChange={(e) => setEnrollmentForm({ ...enrollmentForm, student_phone: e.target.value })}
                                            placeholder="Telefone (opcional)"
                                            className="w-full bg-white border border-indigo-200 rounded-lg px-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                        />
                                    </div>
                                    <button
                                        onClick={handleEnrollStudent}
                                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-sm transition-all"
                                    >
                                        <i className="fas fa-user-plus mr-2"></i> Inscrever Aluno
                                    </button>
                                </div>
                            </div>

                            {/* Enrollments List */}
                            <h4 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-4">Alunos Inscritos ({enrollments.length})</h4>
                            <div className="space-y-3">
                                {enrollments.map((enrollment) => (
                                    <div key={enrollment.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <div>
                                            <h5 className="font-bold text-slate-900">{enrollment.student_name}</h5>
                                            <p className="text-xs text-slate-500">{enrollment.student_email}</p>
                                            {enrollment.student_phone && (
                                                <p className="text-xs text-slate-500">{enrollment.student_phone}</p>
                                            )}
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${enrollment.status === 'ENROLLED' ? 'bg-indigo-50 text-indigo-600' : enrollment.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                            {enrollment.status}
                                        </span>
                                    </div>
                                ))}
                                {enrollments.length === 0 && (
                                    <p className="text-center text-slate-500 py-8">Nenhum aluno inscrito ainda</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
