import React, { useState, useEffect } from 'react';
import { Grid, FormControl, InputLabel, Select, MenuItem, FormHelperText, CircularProgress, Box, Typography } from '@mui/material';
import { SelectChangeEvent } from '@mui/material';
import LocationService from '../../../services/LocationService';
import { SWADHAAR_THEME } from '../../utils/swadhaar.constants';

export interface GeoLocationState {
  state: string;
  stateId: string;
  district: string;
  districtId: string;
  block: string;
  blockId: string;
  village: string;
  villageId: string;
}

interface CascadingGeoDropdownsProps {
  values: GeoLocationState;
  onChange: (updatedLocations: GeoLocationState) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
  flatStyle?: boolean;
  singleColumn?: boolean;
}

const CascadingGeoDropdowns: React.FC<CascadingGeoDropdownsProps> = ({
  values,
  onChange,
  errors = {},
  disabled = false,
  flatStyle = false,
  singleColumn = false,
}) => {
  const [states, setStates] = useState<Array<{ id: string; name: string }>>([]);
  const [districts, setDistricts] = useState<Array<{ id: string; name: string }>>([]);
  const [blocks, setBlocks] = useState<Array<{ id: string; name: string }>>([]);
  const [villages, setVillages] = useState<Array<{ id: string; name: string }>>([]);

  const [loading, setLoading] = useState({
    states: false,
    districts: false,
    blocks: false,
    villages: false,
  });

  // Load states on mount
  useEffect(() => {
    const loadStates = async () => {
      setLoading((prev) => ({ ...prev, states: true }));
      try {
        const statesData = await LocationService.getStates();
        setStates(statesData || []);
      } catch (error) {
        console.error('Failed to load states in Swadhaar Geo Cascader:', error);
      } finally {
        setLoading((prev) => ({ ...prev, states: false }));
      }
    };

    loadStates();
  }, []);

  // Pre-populate child lists if values already contain IDs (e.g. in Edit modes)
  useEffect(() => {
    const prefillChildDropdowns = async () => {
      if (values.stateId) {
        setLoading((prev) => ({ ...prev, districts: true }));
        try {
          const distData = await LocationService.getDistricts(values.stateId);
          setDistricts(distData || []);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading((prev) => ({ ...prev, districts: false }));
        }
      }
      if (values.districtId) {
        setLoading((prev) => ({ ...prev, blocks: true }));
        try {
          const blockData = await LocationService.getBlocks(values.districtId);
          setBlocks(blockData || []);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading((prev) => ({ ...prev, blocks: false }));
        }
      }
      if (values.blockId) {
        setLoading((prev) => ({ ...prev, villages: true }));
        try {
          const vilData = await LocationService.getVillages(values.blockId);
          setVillages(vilData || []);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading((prev) => ({ ...prev, villages: false }));
        }
      }
    };

    prefillChildDropdowns();
  }, [values.stateId, values.districtId, values.blockId]);

  const handleStateChange = async (event: SelectChangeEvent<string>) => {
    const name = event.target.value;
    const selectedState = states.find((s) => s.name === name);
    const stateId = selectedState?.id || '';

    // State change clears all children
    const updated: GeoLocationState = {
      ...values,
      state: name,
      stateId,
      district: '',
      districtId: '',
      block: '',
      blockId: '',
      village: '',
      villageId: '',
    };
    onChange(updated);

    setDistricts([]);
    setBlocks([]);
    setVillages([]);

    if (stateId) {
      setLoading((prev) => ({ ...prev, districts: true }));
      try {
        const districtsData = await LocationService.getDistricts(stateId);
        setDistricts(districtsData || []);
      } catch (error) {
        console.error('Failed to load districts:', error);
      } finally {
        setLoading((prev) => ({ ...prev, districts: false }));
      }
    }
  };

  const handleDistrictChange = async (event: SelectChangeEvent<string>) => {
    const name = event.target.value;
    const selectedDistrict = districts.find((d) => d.name === name);
    const districtId = selectedDistrict?.id || '';

    // District change clears blocks and villages
    const updated: GeoLocationState = {
      ...values,
      district: name,
      districtId,
      block: '',
      blockId: '',
      village: '',
      villageId: '',
    };
    onChange(updated);

    setBlocks([]);
    setVillages([]);

    if (districtId) {
      setLoading((prev) => ({ ...prev, blocks: true }));
      try {
        const blocksData = await LocationService.getBlocks(districtId);
        setBlocks(blocksData || []);
      } catch (error) {
        console.error('Failed to load blocks:', error);
      } finally {
        setLoading((prev) => ({ ...prev, blocks: false }));
      }
    }
  };

  const handleBlockChange = async (event: SelectChangeEvent<string>) => {
    const name = event.target.value;
    const selectedBlock = blocks.find((b) => b.name === name);
    const blockId = selectedBlock?.id || '';

    // Block change clears villages
    const updated: GeoLocationState = {
      ...values,
      block: name,
      blockId,
      village: '',
      villageId: '',
    };
    onChange(updated);

    setVillages([]);

    if (blockId) {
      setLoading((prev) => ({ ...prev, villages: true }));
      try {
        const villagesData = await LocationService.getVillages(blockId);
        setVillages(villagesData || []);
      } catch (error) {
        console.error('Failed to load villages:', error);
      } finally {
        setLoading((prev) => ({ ...prev, villages: false }));
      }
    }
  };

  const handleVillageChange = (event: SelectChangeEvent<string>) => {
    const name = event.target.value;
    const selectedVillage = villages.find((v) => v.name === name);
    const villageId = selectedVillage?.id || '';

    const updated: GeoLocationState = {
      ...values,
      village: name,
      villageId,
    };
    onChange(updated);
  };

  return (
    <Grid container spacing={2}>
      {/* 1. State */}
      <Grid item xs={12} sm={singleColumn ? 12 : 6}>
        {flatStyle ? (
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: '14px', mb: '6px', color: '#1F2937' }}>
              State <span style={{ color: '#E11D48' }}>*</span>
            </Typography>
            <FormControl fullWidth error={!!errors.state} disabled={disabled || loading.states}>
              <Select
                displayEmpty
                value={values.state}
                onChange={handleStateChange}
                renderValue={(selected) => {
                  if (!selected) {
                    return <span style={{ color: '#9CA3AF' }}>Select State</span>;
                  }
                  return selected as string;
                }}
                sx={{
                  backgroundColor: '#F3F4F6',
                  borderRadius: '8px',
                  '& fieldset': { border: 'none' },
                  '&:hover fieldset': { border: 'none' },
                  '&.Mui-focused fieldset': { border: '1px solid #1E293B' },
                  '& .MuiSelect-select': {
                    padding: '12px 16px',
                    fontSize: '14px',
                    color: values.state ? '#1F2937' : '#9CA3AF',
                  }
                }}
              >
                {states.map((s) => (
                  <MenuItem key={s.id} value={s.name}>
                    {s.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.state && <FormHelperText>{errors.state}</FormHelperText>}
            </FormControl>
          </Box>
        ) : (
          <FormControl fullWidth error={!!errors.state} disabled={disabled || loading.states}>
            <InputLabel id="state-select-label">Select State</InputLabel>
            <Select
              labelId="state-select-label"
              value={values.state}
              label="Select State"
              onChange={handleStateChange}
            >
              {states.map((s) => (
                <MenuItem key={s.id} value={s.name}>
                  {s.name}
                </MenuItem>
              ))}
            </Select>
            {errors.state && <FormHelperText>{errors.state}</FormHelperText>}
          </FormControl>
        )}
      </Grid>

      {/* 2. District */}
      <Grid item xs={12} sm={singleColumn ? 12 : 6}>
        {flatStyle ? (
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: '14px', mb: '6px', color: '#1F2937' }}>
              Distict <span style={{ color: '#E11D48' }}>*</span>
            </Typography>
            <FormControl
              fullWidth
              error={!!errors.district}
              disabled={disabled || !values.stateId || loading.districts}
            >
              <Select
                displayEmpty
                value={values.district}
                onChange={handleDistrictChange}
                renderValue={(selected) => {
                  if (!selected) {
                    return <span style={{ color: '#9CA3AF' }}>Select District</span>;
                  }
                  return selected as string;
                }}
                sx={{
                  backgroundColor: '#F3F4F6',
                  borderRadius: '8px',
                  '& fieldset': { border: 'none' },
                  '&:hover fieldset': { border: 'none' },
                  '&.Mui-focused fieldset': { border: '1px solid #1E293B' },
                  '& .MuiSelect-select': {
                    padding: '12px 16px',
                    fontSize: '14px',
                    color: values.district ? '#1F2937' : '#9CA3AF',
                  }
                }}
              >
                {districts.map((d) => (
                  <MenuItem key={d.id} value={d.name}>
                    {d.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.district && <FormHelperText>{errors.district}</FormHelperText>}
            </FormControl>
          </Box>
        ) : (
          <FormControl
            fullWidth
            error={!!errors.district}
            disabled={disabled || !values.stateId || loading.districts}
          >
            <InputLabel id="district-select-label">Select District</InputLabel>
            <Select
              labelId="district-select-label"
              value={values.district}
              label="Select District"
              onChange={handleDistrictChange}
            >
              {districts.map((d) => (
                <MenuItem key={d.id} value={d.name}>
                  {d.name}
                </MenuItem>
              ))}
            </Select>
            {errors.district && <FormHelperText>{errors.district}</FormHelperText>}
          </FormControl>
        )}
      </Grid>

      {/* 3. Block */}
      <Grid item xs={12} sm={singleColumn ? 12 : 6}>
        {flatStyle ? (
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: '14px', mb: '6px', color: '#1F2937' }}>
              Block <span style={{ color: '#E11D48' }}>*</span>
            </Typography>
            <FormControl
              fullWidth
              error={!!errors.block}
              disabled={disabled || !values.districtId || loading.blocks}
            >
              <Select
                displayEmpty
                value={values.block}
                onChange={handleBlockChange}
                renderValue={(selected) => {
                  if (!selected) {
                    return <span style={{ color: '#9CA3AF' }}>Select block</span>;
                  }
                  return selected as string;
                }}
                sx={{
                  backgroundColor: '#F3F4F6',
                  borderRadius: '8px',
                  '& fieldset': { border: 'none' },
                  '&:hover fieldset': { border: 'none' },
                  '&.Mui-focused fieldset': { border: '1px solid #1E293B' },
                  '& .MuiSelect-select': {
                    padding: '12px 16px',
                    fontSize: '14px',
                    color: values.block ? '#1F2937' : '#9CA3AF',
                  }
                }}
              >
                {blocks.map((b) => (
                  <MenuItem key={b.id} value={b.name}>
                    {b.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.block && <FormHelperText>{errors.block}</FormHelperText>}
            </FormControl>
          </Box>
        ) : (
          <FormControl
            fullWidth
            error={!!errors.block}
            disabled={disabled || !values.districtId || loading.blocks}
          >
            <InputLabel id="block-select-label">Select Block</InputLabel>
            <Select
              labelId="block-select-label"
              value={values.block}
              label="Select Block"
              onChange={handleBlockChange}
            >
              {blocks.map((b) => (
                <MenuItem key={b.id} value={b.name}>
                  {b.name}
                </MenuItem>
              ))}
            </Select>
            {errors.block && <FormHelperText>{errors.block}</FormHelperText>}
          </FormControl>
        )}
      </Grid>

      {/* 4. Village */}
      <Grid item xs={12} sm={singleColumn ? 12 : 6}>
        {flatStyle ? (
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: '14px', mb: '6px', color: '#1F2937' }}>
              Village <span style={{ color: '#E11D48' }}>*</span>
            </Typography>
            <FormControl
              fullWidth
              error={!!errors.village}
              disabled={disabled || !values.blockId || loading.villages}
            >
              <Select
                displayEmpty
                value={values.village}
                onChange={handleVillageChange}
                renderValue={(selected) => {
                  if (!selected) {
                    return <span style={{ color: '#9CA3AF' }}>Select village</span>;
                  }
                  return selected as string;
                }}
                sx={{
                  backgroundColor: '#F3F4F6',
                  borderRadius: '8px',
                  '& fieldset': { border: 'none' },
                  '&:hover fieldset': { border: 'none' },
                  '&.Mui-focused fieldset': { border: '1px solid #1E293B' },
                  '& .MuiSelect-select': {
                    padding: '12px 16px',
                    fontSize: '14px',
                    color: values.village ? '#1F2937' : '#9CA3AF',
                  }
                }}
              >
                {villages.map((v) => (
                  <MenuItem key={v.id} value={v.name}>
                    {v.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.village && <FormHelperText>{errors.village}</FormHelperText>}
            </FormControl>
          </Box>
        ) : (
          <FormControl
            fullWidth
            error={!!errors.village}
            disabled={disabled || !values.blockId || loading.villages}
          >
            <InputLabel id="village-select-label">Select Village</InputLabel>
            <Select
              labelId="village-select-label"
              value={values.village}
              label="Select Village"
              onChange={handleVillageChange}
            >
              {villages.map((v) => (
                <MenuItem key={v.id} value={v.name}>
                  {v.name}
                </MenuItem>
              ))}
            </Select>
            {errors.village && <FormHelperText>{errors.village}</FormHelperText>}
          </FormControl>
        )}
      </Grid>
    </Grid>
  );
};

export default CascadingGeoDropdowns;
