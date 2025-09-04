import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Upload, BookOpen, Star, TrendingUp, Users, FileText } from 'lucide-react';
import { resourcesAPI } from '../utils/api';
import ResourceCard from '../components/ResourceCard';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    examCategory: 'All',
    section: 'All',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResources: 0,
    hasNext: false,
    hasPrev: false
  });

  const examCategories = ['All', 'UPSC', 'JEE', 'GATE', 'NEET', 'CAT', 'SSC', 'Banking', 'Railway', 'Other'];
  const sections = ['All', 'General', 'Optional', 'Subject-specific', 'Previous Papers', 'Notes', 'Books', 'Other'];
  const sortOptions = [
    { value: 'createdAt', label: 'Newest First' },
    { value: 'stars', label: 'Highest Rated' },
    { value: 'downloadCount', label: 'Most Downloaded' },
    { value: 'title', label: 'Title A-Z' }
  ];

  const fetchResources = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page,
        limit: 12
      };

      const response = await resourcesAPI.getAll(params);
      setResources(response.data.resources);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources(1);
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchResources(1);
  };

  const handlePageChange = (page) => {
    fetchResources(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const stats = [
    {
      name: 'Total Resources',
      value: pagination.totalResources,
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      name: 'Exam Categories',
      value: examCategories.length - 1,
      icon: BookOpen,
      color: 'text-green-600'
    },
    {
      name: 'Active Users',
      value: '1.2K+',
      icon: Users,
      color: 'text-purple-600'
    },
    {
      name: 'Downloads',
      value: '10K+',
      icon: TrendingUp,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to ExamPrepShare
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Discover and share study resources for competitive exams. 
          Find the best materials for UPSC, JEE, GATE, and more.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg bg-gray-50 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.name}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="card-content">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search resources by title, description, or tags..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="input pl-10"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Exam Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exam Category
                </label>
                <select
                  value={filters.examCategory}
                  onChange={(e) => handleFilterChange('examCategory', e.target.value)}
                  className="input"
                >
                  {examCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Section Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section
                </label>
                <select
                  value={filters.section}
                  onChange={(e) => handleFilterChange('section', e.target.value)}
                  className="input"
                >
                  {sections.map(section => (
                    <option key={section} value={section}>{section}</option>
                  ))}
                </select>
              </div>

              {/* Sort Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="input"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                className="btn btn-primary flex items-center space-x-2"
              >
                <Search className="w-4 h-4" />
                <span>Search Resources</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Upload CTA */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">Have study materials to share?</h3>
            <p className="text-blue-100">
              Upload your notes, books, and resources to help other students succeed.
            </p>
          </div>
          <Link
            to="/upload"
            className="btn bg-white text-blue-600 hover:bg-gray-50 flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Resource</span>
          </Link>
        </div>
      </div>

      {/* Resources Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {filters.search ? 'Search Results' : 'Latest Resources'}
          </h2>
          <div className="text-sm text-gray-600">
            {pagination.totalResources} resources found
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="card animate-pulse">
                <div className="card-header">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="card-content">
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : resources.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((resource) => (
                <ResourceCard key={resource._id} resource={resource} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className="btn btn-outline btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="flex items-center space-x-1">
                  {[...Array(pagination.totalPages)].map((_, index) => {
                    const page = index + 1;
                    const isCurrentPage = page === pagination.currentPage;
                    
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`btn btn-sm ${
                          isCurrentPage 
                            ? 'btn-primary' 
                            : 'btn-outline'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="btn btn-outline btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
            <p className="text-gray-600 mb-6">
              {filters.search 
                ? 'Try adjusting your search criteria or filters.'
                : 'Be the first to upload a resource!'
              }
            </p>
            <Link
              to="/upload"
              className="btn btn-primary"
            >
              Upload Resource
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
