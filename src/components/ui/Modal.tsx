import React, { Fragment } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />

                <div className="relative transform overflow-hidden rounded-[2rem] bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-slate-900 leading-6" id="modal-title">
                                {title}
                            </h3>
                            <button
                                type="button"
                                className="rounded-xl p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-500 transition-colors"
                                onClick={onClose}
                            >
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        <div className="mt-2 text-slate-600">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
