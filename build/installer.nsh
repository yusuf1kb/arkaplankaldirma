!macro customInstall
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\image\shell\ArkaPlanKaldir" "" "Arka Planı Kaldır ve Düzenle"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\image\shell\ArkaPlanKaldir" "Icon" "$INSTDIR\${APP_EXECUTABLE_FILENAME}"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\image\shell\ArkaPlanKaldir" "MultiSelectModel" "Single"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\image\shell\ArkaPlanKaldir\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"'
!macroend

!macro customUnInstall
  DeleteRegKey HKCU "Software\Classes\SystemFileAssociations\image\shell\ArkaPlanKaldir"
!macroend
