use clap::{Parser, Subcommand};
use libbootforge::usb::detect_devices;
use serde_json;
use std::process;

#[derive(Parser)]
#[command(name = "bootforgeusb")]
#[command(about = "BootForge USB enumeration CLI", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Scan for USB devices
    Scan {
        /// Output as JSON
        #[arg(long)]
        json: bool,
    },
    /// Write image to device
    Write {
        #[arg(short, long)]
        image: String,
        #[arg(short, long)]
        target: String,
    },
    /// Detect device mode
    Detect {
        #[arg(short, long)]
        serial: Option<String>,
    },
}

fn main() {
    env_logger::Builder::from_default_env()
        .filter_level(log::LevelFilter::Warn)
        .init();

    let cli = Cli::parse();

    match cli.command {
        Commands::Scan { json } => {
            match detect_devices() {
                Ok(devices) => {
                    if json {
                        match serde_json::to_string_pretty(&devices) {
                            Ok(json_str) => {
                                println!("{}", json_str);
                            }
                            Err(e) => {
                                eprintln!("Failed to serialize devices: {}", e);
                                process::exit(1);
                            }
                        }
                    } else {
                        if devices.is_empty() {
                            println!("No devices found.");
                        } else {
                            println!("Found {} device(s):", devices.len());
                            for dev in devices {
                                println!(
                                    "  {:?} - {} {} ({:04x}:{:04x})",
                                    dev.platform,
                                    dev.manufacturer.as_deref().unwrap_or("Unknown"),
                                    dev.product.as_deref().unwrap_or("Unknown"),
                                    dev.vendor_id,
                                    dev.product_id
                                );
                            }
                        }
                    }
                }
                Err(e) => {
                    eprintln!("Failed to scan devices: {}", e);
                    process::exit(1);
                }
            }
        }
        Commands::Write { image, target } => {
            println!("Would write {} to {}", image, target);
        }
        Commands::Detect { serial } => {
            println!("Detecting device mode for {:?}", serial);
        }
    }
}
