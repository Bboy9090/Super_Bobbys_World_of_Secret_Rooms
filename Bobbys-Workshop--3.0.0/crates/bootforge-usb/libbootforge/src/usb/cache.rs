use crate::{BootforgeError, Result};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceCacheEntry {
    pub unique_key: String,
    pub first_seen: DateTime<Utc>,
    pub last_seen: DateTime<Utc>,
    pub seen_count: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceCache {
    pub devices: HashMap<String, DeviceCacheEntry>,
    pub version: u32,
}

impl DeviceCache {
    pub fn new() -> Self {
        DeviceCache {
            devices: HashMap::new(),
            version: 1,
        }
    }

    pub fn get_entry(&self, unique_key: &str) -> Option<&DeviceCacheEntry> {
        self.devices.get(unique_key)
    }

    pub fn update_entry(&mut self, unique_key: String, last_seen: DateTime<Utc>) {
        let entry = self.devices.entry(unique_key.clone()).or_insert_with(|| {
            DeviceCacheEntry {
                unique_key: unique_key.clone(),
                first_seen: last_seen,
                last_seen,
                seen_count: 0,
            }
        });

        entry.last_seen = last_seen;
        entry.seen_count += 1;
    }

    pub fn get_or_create_first_seen(&mut self, unique_key: &str, default: DateTime<Utc>) -> DateTime<Utc> {
        match self.devices.get(unique_key) {
            Some(entry) => entry.first_seen,
            None => {
                let entry = DeviceCacheEntry {
                    unique_key: unique_key.to_string(),
                    first_seen: default,
                    last_seen: default,
                    seen_count: 0,
                };
                self.devices.insert(unique_key.to_string(), entry);
                default
            }
        }
    }
}

pub fn get_cache_path() -> Result<PathBuf> {
    #[cfg(target_os = "windows")]
    {
        let local_app_data = std::env::var("LOCALAPPDATA")
            .or_else(|_| std::env::var("APPDATA"))
            .map_err(|_| BootforgeError::Usb("Could not determine cache directory".to_string()))?;
        
        let cache_dir = Path::new(&local_app_data).join("BobbysWorkshop");
        Ok(cache_dir.join("devices.json"))
    }

    #[cfg(any(target_os = "macos", target_os = "linux"))]
    {
        let home = std::env::var("HOME")
            .map_err(|_| BootforgeError::Usb("Could not determine home directory".to_string()))?;
        
        let cache_dir = Path::new(&home).join(".local").join("share").join("bobbys-workshop");
        Ok(cache_dir.join("devices.json"))
    }
}

pub fn load_cache() -> Result<DeviceCache> {
    let cache_path = get_cache_path()?;
    
    if !cache_path.exists() {
        log::debug!("Cache file does not exist, creating new cache: {:?}", cache_path);
        return Ok(DeviceCache::new());
    }

    match fs::read_to_string(&cache_path) {
        Ok(content) => {
            match serde_json::from_str::<DeviceCache>(&content) {
                Ok(cache) => {
                    log::debug!("Loaded device cache: {} entries", cache.devices.len());
                    Ok(cache)
                }
                Err(e) => {
                    log::warn!("Failed to parse cache file, creating new cache: {}", e);
                    Ok(DeviceCache::new())
                }
            }
        }
        Err(e) => {
            log::warn!("Failed to read cache file, creating new cache: {}", e);
            Ok(DeviceCache::new())
        }
    }
}

pub fn save_cache(cache: &DeviceCache) -> Result<()> {
    let cache_path = get_cache_path()?;
    
    // Create parent directory if it doesn't exist
    if let Some(parent) = cache_path.parent() {
        fs::create_dir_all(parent).map_err(|e| {
            BootforgeError::Usb(format!("Failed to create cache directory: {}", e))
        })?;
    }

    let json = serde_json::to_string_pretty(cache).map_err(|e| {
        BootforgeError::Usb(format!("Failed to serialize cache: {}", e))
    })?;

    fs::write(&cache_path, json).map_err(|e| {
        BootforgeError::Usb(format!("Failed to write cache file: {}", e))
    })?;

    log::debug!("Saved device cache: {} entries to {:?}", cache.devices.len(), cache_path);
    Ok(())
}
