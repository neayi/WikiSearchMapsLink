# WikiSearchMapsLink

MediaWiki extension that creates a binding link between WikiSearch and Semantic Maps.

## Requirements

- MediaWiki 1.43 or later

## Installation

1. Clone this repository to your MediaWiki `extensions` directory:
   ```bash
   cd extensions/
   git clone https://github.com/neayi/WikiSearchMapsLink.git
   ```

2. Add the following line to your `LocalSettings.php`:
   ```php
   wfLoadExtension( 'WikiSearchMapsLink' );
   ```

3. Navigate to Special:Version on your wiki to verify that the extension is successfully installed.

## Usage

Once installed, the extension will automatically load a JavaScript file that provides the binding functionality between WikiSearch and Semantic Maps.

## License

This extension is licensed under the GNU General Public License v3.0 or later. See the LICENSE file for details.
