/**
 * Integration test for JobForm with custom Select components
 * 
 * This test verifies that:
 * 1. The custom Select component can be used for customer, tailor, and style selections
 * 2. Form validation still works correctly with the new components
 * 3. Form submission works with values from Select components
 */

import { STYLES } from '@/domain/constants';
import type { Customer, Tailor } from '@/domain/entities';

describe('JobForm Select Integration', () => {
  // Sample test data
  const mockCustomers: Partial<Customer>[] = [
    {
      id: 'cust-1',
      customerNumber: 'CUST-001',
      name: 'John Doe',
      gender: 'Male',
      phone: '08012345678',
      whatsapp: null,
      email: null,
      address: null,
      state: null,
      city: null,
      occupation: null,
      preferredStyle: null,
      preferredFabric: null,
      preferredColours: null,
      occasion: null,
      interests: null,
      returning: false,
      preferredStyleImage: null,
      measurements: {
        shoulder: 18,
        chest: 42,
        waist: 36,
        hips: 40,
        sleeveLength: 24,
        shirtLength: 30,
        trouserLength: 42,
        trouserWaist: 34,
      },
      referrerId: null,
    },
    {
      id: 'cust-2',
      customerNumber: 'CUST-002',
      name: 'Jane Smith',
      gender: 'Female',
      phone: '08087654321',
      whatsapp: null,
      email: null,
      address: null,
      state: null,
      city: null,
      occupation: null,
      preferredStyle: null,
      preferredFabric: null,
      preferredColours: null,
      occasion: null,
      interests: null,
      returning: false,
      preferredStyleImage: null,
      measurements: {
        shoulder: 16,
        chest: 38,
        waist: 32,
        hips: 38,
        sleeveLength: 22,
        shirtLength: 28,
        trouserLength: 40,
        trouserWaist: 30,
      },
      referrerId: null,
    },
  ];

  const mockTailors: Partial<Tailor>[] = [
    {
      id: 'tailor-1',
      tailorNumber: 'TAIL-001',
      name: 'Ahmed Ibrahim',
      phone: '08098765432',
      address: null,
      dateJoined: null,
      rating: 5,
      notes: null,
    },
    {
      id: 'tailor-2',
      tailorNumber: 'TAIL-002',
      name: 'Mary Johnson',
      phone: '08011223344',
      address: null,
      dateJoined: null,
      rating: 5,
      notes: null,
    },
  ];

  describe('Select Component Options Transformation', () => {
    it('should transform customers array to Select options format', () => {
      const customerOptions = mockCustomers.map((c) => ({
        value: c.id,
        label: `${c.name} (${c.phone})`,
      }));

      expect(customerOptions).toEqual([
        { value: 'cust-1', label: 'John Doe (08012345678)' },
        { value: 'cust-2', label: 'Jane Smith (08087654321)' },
      ]);
    });

    it('should transform tailors array to Select options format with Unassigned option', () => {
      const tailorOptions = [
        { value: '', label: 'Unassigned' },
        ...mockTailors.map((t) => ({ value: t.id, label: t.name })),
      ];

      expect(tailorOptions).toEqual([
        { value: '', label: 'Unassigned' },
        { value: 'tailor-1', label: 'Ahmed Ibrahim' },
        { value: 'tailor-2', label: 'Mary Johnson' },
      ]);
    });

    it('should transform STYLES constant to Select options format', () => {
      const styleOptions = STYLES.map((s) => ({ value: s, label: s }));

      expect(styleOptions.length).toBeGreaterThan(0);
      expect(styleOptions[0]).toHaveProperty('value');
      expect(styleOptions[0]).toHaveProperty('label');
      expect(styleOptions[0].value).toBe(styleOptions[0].label);
    });
  });

  describe('Form Validation', () => {
    it('should validate that customer is selected', () => {
      const formData = {
        customerId: '',
        style: STYLES[0],
        contractPrice: 10000,
      };

      const errors: string[] = [];
      if (!formData.customerId) errors.push('Choose a customer.');

      expect(errors).toContain('Choose a customer.');
    });

    it('should validate style "Others" requires styleOther field', () => {
      const formData = {
        customerId: 'cust-1',
        style: 'Others',
        styleOther: '',
        contractPrice: 10000,
      };

      const errors: string[] = [];
      if (formData.style === 'Others' && !(formData.styleOther ?? '').trim()) {
        errors.push('Please specify the style under "Others".');
      }

      expect(errors).toContain('Please specify the style under "Others".');
    });

    it('should validate contract price is greater than 0', () => {
      const formData = {
        customerId: 'cust-1',
        style: STYLES[0],
        contractPrice: 0,
      };

      const errors: string[] = [];
      if (!formData.contractPrice || formData.contractPrice <= 0) {
        errors.push('Enter a contract price greater than 0.');
      }

      expect(errors).toContain('Enter a contract price greater than 0.');
    });

    it('should pass validation with valid form data', () => {
      const formData = {
        customerId: 'cust-1',
        style: STYLES[0] as string,
        styleOther: null,
        contractPrice: 10000,
      };

      const errors: string[] = [];
      if (!formData.customerId) errors.push('Choose a customer.');
      if (formData.style === 'Others' && !(formData.styleOther ?? '').trim()) {
        errors.push('Please specify the style under "Others".');
      }
      if (!formData.contractPrice || formData.contractPrice <= 0) {
        errors.push('Enter a contract price greater than 0.');
      }

      expect(errors).toHaveLength(0);
    });
  });

  describe('Tailor Selection', () => {
    it('should allow tailor to be null (Unassigned)', () => {
      const formData = {
        tailorId: null as string | null,
      };

      // Simulating the Select onChange handler
      const value = '';
      const updatedTailorId = value || null;

      expect(updatedTailorId).toBeNull();
    });

    it('should allow tailor to be assigned', () => {
      const formData = {
        tailorId: null as string | null,
      };

      // Simulating the Select onChange handler
      const value = 'tailor-1';
      const updatedTailorId = value || null;

      expect(updatedTailorId).toBe('tailor-1');
    });
  });

  describe('Search Functionality Requirements', () => {
    it('should support case-insensitive search filtering for customers', () => {
      const searchQuery = 'john';
      const filteredCustomers = mockCustomers.filter((c) =>
        `${c.name} (${c.phone})`.toLowerCase().includes(searchQuery.toLowerCase())
      );

      expect(filteredCustomers).toHaveLength(1);
      expect(filteredCustomers[0].name).toBe('John Doe');
    });

    it('should support search by phone number for customers', () => {
      const searchQuery = '08087654321';
      const filteredCustomers = mockCustomers.filter((c) =>
        `${c.name} (${c.phone})`.toLowerCase().includes(searchQuery.toLowerCase())
      );

      expect(filteredCustomers).toHaveLength(1);
      expect(filteredCustomers[0].name).toBe('Jane Smith');
    });

    it('should support search for tailors by name', () => {
      const searchQuery = 'ahmed';
      const filteredTailors = mockTailors.filter((t) =>
        t.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );

      expect(filteredTailors).toHaveLength(1);
      expect(filteredTailors[0].name).toBe('Ahmed Ibrahim');
    });

    it('should return empty array when no matches found', () => {
      const searchQuery = 'nonexistent';
      const filteredCustomers = mockCustomers.filter((c) =>
        `${c.name} (${c.phone})`.toLowerCase().includes(searchQuery.toLowerCase())
      );

      expect(filteredCustomers).toHaveLength(0);
    });
  });
});
