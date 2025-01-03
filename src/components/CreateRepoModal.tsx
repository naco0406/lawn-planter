// src/components/CreateRepoModal.tsx
'use client'

interface CreateRepoModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function CreateRepoModal({ isOpen, onConfirm, onCancel }: CreateRepoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">저장소 생성</h2>
        <p className="mb-6 text-gray-600">
          'lawn-diary' 저장소를 생성합니다. 이 저장소는 마크다운 형식의 일기를 저장하고 잔디를 심는 데 사용됩니다.
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            생성하기
          </button>
        </div>
      </div>
    </div>
  );
}