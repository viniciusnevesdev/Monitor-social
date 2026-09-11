import React, { useState } from 'react';
import { Contact, ContactCategory } from '../types';
import { parseVcfContacts, pickDeviceContacts } from '../utils/integrations';
import {
  X,
  Smartphone,
  Upload,
  FileText,
  Check,
  CheckCircle2,
  Users,
  AlertCircle
} from 'lucide-react';

interface ImportContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportContacts: (imported: Partial<Contact>[]) => void;
}

export const ImportContactsModal: React.FC<ImportContactsModalProps> = ({
  isOpen,
  onClose,
  onImportContacts,
}) => {
  if (!isOpen) return null;

  const [previewList, setPreviewList] = useState<Partial<Contact>[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const hasNativePicker = typeof window !== 'undefined' && 'contacts' in navigator;

  const handleDevicePicker = async () => {
    setErrorMsg(null);
    try {
      const contacts = await pickDeviceContacts();
      if (contacts && contacts.length > 0) {
        setPreviewList(contacts);
        setSelectedIndices(contacts.map((_, i) => i));
      } else {
        setErrorMsg('Nenhum contato foi retornado pela agenda do dispositivo.');
      }
    } catch (e) {
      setErrorMsg('Não foi possível acessar a agenda nativa.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const contacts = parseVcfContacts(text);
        if (contacts.length > 0) {
          setPreviewList(contacts);
          setSelectedIndices(contacts.map((_, i) => i));
          setErrorMsg(null);
        } else {
          setErrorMsg('Nenhum contato válido encontrado no arquivo .vcf.');
        }
      } catch (err) {
        setErrorMsg('Erro ao ler o arquivo vCard.');
      }
    };
    reader.readAsText(file);
  };

  const toggleSelect = (index: number) => {
    setSelectedIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleConfirmImport = () => {
    const chosen = previewList.filter((_, i) => selectedIndices.includes(i));
    if (chosen.length === 0) {
      setErrorMsg('Selecione ao menos um contato para importar.');
      return;
    }

    onImportContacts(chosen);
    setSuccessMsg(`${chosen.length} contatos adicionados com sucesso!`);
    setTimeout(() => {
      setSuccessMsg(null);
      setPreviewList([]);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Importar Contatos da Agenda
            </h2>
            <p className="text-xs text-slate-500">
              Traga amigos do seu celular ou arquivo .vcf sem precisar digitar tudo.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {previewList.length === 0 ? (
            <div className="space-y-3">
              {/* Opção 1: Agenda Nativa */}
              <button
                type="button"
                onClick={handleDevicePicker}
                className="w-full p-4 rounded-2xl border-2 border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 hover:border-indigo-300 transition-all text-left flex items-center gap-3.5 group"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Selecionar da Agenda do Dispositivo
                  </h4>
                  <p className="text-xs text-slate-500">
                    Abre o seletor de contatos nativo do celular (Chrome / Android).
                  </p>
                </div>
              </button>

              {/* Opção 2: Arquivo .VCF */}
              <label className="w-full p-4 rounded-2xl border-2 border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100/70 transition-all text-left flex items-center gap-3.5 cursor-pointer group">
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 text-sm">
                    Importar Arquivo de Contatos (.VCF / vCard)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Compatível com contatos exportados do iPhone, Android ou Google Contatos.
                  </p>
                </div>
                <input
                  type="file"
                  accept=".vcf,.vcard"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>{previewList.length} contatos encontrados</span>
                <span>{selectedIndices.length} selecionados</span>
              </div>

              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-2xl bg-slate-50/50">
                {previewList.map((contact, idx) => {
                  const isChecked = selectedIndices.includes(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleSelect(idx)}
                      className="p-3 flex items-center justify-between hover:bg-white cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                            isChecked
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 text-xs block">
                            {contact.name}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {contact.phone || contact.email || 'Sem telefone'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPreviewList([])}
                  className="w-1/3 py-2 px-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="w-2/3 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm"
                >
                  Adicionar {selectedIndices.length} Contatos
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
