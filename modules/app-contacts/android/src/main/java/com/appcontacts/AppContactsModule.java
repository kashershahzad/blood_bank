package com.appcontacts;

import android.content.ContentResolver;
import android.database.Cursor;
import android.provider.ContactsContract;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import java.util.HashSet;

public class AppContactsModule extends ReactContextBaseJavaModule {
  public static final String NAME = "AppContacts";

  AppContactsModule(ReactApplicationContext context) {
    super(context);
  }

  @Override
  public String getName() {
    return NAME;
  }

  @ReactMethod
  public void getAll(Promise promise) {
    new Thread(
            () -> {
              try {
                WritableArray results = Arguments.createArray();
                HashSet<String> seen = new HashSet<>();
                ContentResolver resolver = getReactApplicationContext().getContentResolver();
                Cursor cursor =
                    resolver.query(
                        ContactsContract.CommonDataKinds.Phone.CONTENT_URI,
                        new String[] {
                          ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME,
                          ContactsContract.CommonDataKinds.Phone.NUMBER
                        },
                        null,
                        null,
                        ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME + " COLLATE LOCALIZED ASC");

                if (cursor != null) {
                  int nameIndex =
                      cursor.getColumnIndex(ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME);
                  int phoneIndex =
                      cursor.getColumnIndex(ContactsContract.CommonDataKinds.Phone.NUMBER);

                  while (cursor.moveToNext()) {
                    String name = nameIndex >= 0 ? cursor.getString(nameIndex) : "";
                    String phone = phoneIndex >= 0 ? cursor.getString(phoneIndex) : "";
                    if (phone == null || phone.trim().isEmpty()) {
                      continue;
                    }

                    String digits = phone.replaceAll("[^0-9]", "");
                    if (digits.isEmpty()) {
                      continue;
                    }

                    String key = (name == null ? "" : name.trim()) + "|" + digits;
                    if (!seen.add(key)) {
                      continue;
                    }

                    WritableMap item = Arguments.createMap();
                    item.putString(
                        "name",
                        name == null || name.trim().isEmpty() ? "Unknown" : name.trim());
                    item.putString("phone", digits);
                    results.pushMap(item);
                  }
                  cursor.close();
                }

                promise.resolve(results);
              } catch (Exception error) {
                promise.reject("CONTACTS_ERROR", error);
              }
            })
        .start();
  }
}
