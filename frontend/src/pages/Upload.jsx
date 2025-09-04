import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, FileText, X, AlertCircle } from 'lucide-react';
import { resourcesAPI } from '../utils/api';
import toast from 'react-hot-toast';

const Upload = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    examCategory: 'UPSC',
    section: 'General',
    tags: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const examCategories = ['UPSC', 'JEE', 'GATE', 'NEET', 'CAT', 'SSC', 'Banking', 'Railway', 'Other'];
  const sections = ['General', 'Optional', 'Subject-specific', 'Previous Papers', 'Notes', 'Books', 'Other'];
  const allowedTypes = ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png'];
  const maxFileSize = 50 * 1024 * 1024; // 50MB

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      // Validate file type
      const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
      if (!allowedTypes.includes(fileExtension)) {
        setErrors(prev => ({
          ...prev,
          file: 'Please select a valid file type (PDF, DOC, DOCX, TXT, JPG, PNG)'
        }));
        return;
      }

      // Validate file size
      if (selectedFile.size > maxFileSize) {
        setErrors(prev => ({
          ...prev,
          file: 'File size must be less than 50MB'
        }));
        return;
      }

      setFile(selectedFile);
      setErrors(prev => ({
        ...prev,
        file: ''
      }));
    }
  };

  const removeFile = () => {
    setFile(null);
    setErrors(prev => ({
      ...prev,
      file: ''
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!file) {
      newErrors.file = 'Please select a file to upload';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const uploadData = new FormData();
      uploadData.append('title', formData.title.trim());
      uploadData.append('description', formData.description.trim());
      uploadData.append('examCategory', formData.examCategory);
      uploadData.append('section', formData.section);
      uploadData.append('tags', formData.tags.trim());
      uploadData.append('file', file);

      const response = await resourcesAPI.create(uploadData);
      
      toast.success('Resource uploaded successfully!');
      navigate(`/resource/${response.data.resource._id}`);
    } catch (error) {
      console.error('Upload error:', error);
      const message = error.response?.data?.message || 'Failed to upload resource';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Resource</h1>
        <p className="text-gray-600">
          Share your study materials with the community
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Field */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Resource Title *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            className={`input ${errors.title ? 'border-red-300 focus:ring-red-500' : ''}`}
            placeholder="Enter a descriptive title for your resource"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.title}
            </p>
          )}
        </div>

        {/* Description Field */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className={`input ${errors.description ? 'border-red-300 focus:ring-red-500' : ''}`}
            placeholder="Describe what this resource contains and how it can help students"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.description}
            </p>
          )}
        </div>

        {/* Category and Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="examCategory" className="block text-sm font-medium text-gray-700 mb-1">
              Exam Category *
            </label>
            <select
              id="examCategory"
              name="examCategory"
              value={formData.examCategory}
              onChange={handleChange}
              className="input"
            >
              {examCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-1">
              Section *
            </label>
            <select
              id="section"
              name="section"
              value={formData.section}
              onChange={handleChange}
              className="input"
            >
              {sections.map(section => (
                <option key={section} value={section}>{section}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tags Field */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
            Tags (Optional)
          </label>
          <input
            id="tags"
            name="tags"
            type="text"
            value={formData.tags}
            onChange={handleChange}
            className="input"
            placeholder="Enter tags separated by commas (e.g., mathematics, physics, formulas)"
          />
          <p className="mt-1 text-sm text-gray-500">
            Add relevant tags to help others find your resource
          </p>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            File Upload *
          </label>
          
          {!file ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                id="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                className="hidden"
              />
              <label htmlFor="file" className="cursor-pointer">
                <UploadIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-gray-500">
                  PDF, DOC, DOCX, TXT, JPG, PNG (max 50MB)
                </p>
              </label>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
          
          {errors.file && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.file}
            </p>
          )}
        </div>

        {/* Guidelines */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Upload Guidelines</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Ensure your resource is relevant and helpful to students</li>
            <li>• Use clear, descriptive titles and descriptions</li>
            <li>• Only upload materials you have the right to share</li>
            <li>• File size must be less than 50MB</li>
            <li>• Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG</li>
          </ul>
        </div>

        {/* Submit Buttons */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex-1 btn btn-outline"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="loading-spinner w-4 h-4"></div>
                <span>Uploading...</span>
              </div>
            ) : (
              'Upload Resource'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Upload;
