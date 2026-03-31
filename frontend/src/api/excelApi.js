import axiosInstance from './axiosConfig'; 

export const excelApi = {
  exportData: async (entity) => {
    const response = await axiosInstance.get(`/excel/export/${entity}`, {
      responseType: 'blob', 
    });
    return response;
  },

  importData: async (entity, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post(`/excel/import/${entity}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  }
};